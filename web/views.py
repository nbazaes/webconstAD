import json
import secrets
import time
import random
from datetime import timedelta
from pathlib import Path
from decimal import Decimal
from urllib.parse import urlencode
import base64
import logging

import requests

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.text import slugify
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods
from rest_framework import status
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import parser_classes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import (
    Carrito,
    CarritoItem,
    Categoria,
    Coleccion,
    Descarga,
    MensajeContacto,
    Orden,
    OrdenItem,
    Producto,
    SuscriptorAnonimo,
    get_r2_storage,
)
from .serializers import MensajeContactoSerializer
from .services.flow import FlowClient, FlowError


logger = logging.getLogger(__name__)


FRONTEND_BUILD_DIR = settings.BASE_DIR / 'web' / 'static' / 'frontend'


def _serve_frontend_page(page: str = '') -> HttpResponse:
    target = FRONTEND_BUILD_DIR / page / 'index.html' if page else FRONTEND_BUILD_DIR / 'index.html'
    if not target.exists() or not target.is_file():
        raise Http404('La pagina frontend no existe. Ejecuta el build de Astro.')
    return HttpResponse(target.read_text(encoding='utf-8'))


def _bad_request(message, status=400):
    return JsonResponse({'ok': False, 'message': message}, status=status)


def _parse_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on', 'si'}


def _user_has_group(user, group_name: str) -> bool:
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    return user.groups.filter(name__iexact=group_name).exists()


def _user_role(user):
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return 'admin'

    if _user_has_group(user, 'Artista'):
        return 'artista'
    if _user_has_group(user, 'Cliente'):
        return 'cliente'

    return 'cliente'


def _serialize_user(user):
    perfil = getattr(user, 'perfil_cliente', None)
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'rol': _user_role(user),
        'is_staff': bool(getattr(user, 'is_staff', False)),
        'is_superuser': bool(getattr(user, 'is_superuser', False)),
        'nombre': perfil.nombre if perfil else '',
        'apellido': perfil.apellido if perfil else '',
        'pais': perfil.pais if perfil else '',
    }


def _ensure_admin(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)
    if _user_role(request.user) not in {'admin', 'artista'}:
        return _bad_request('solo admin o artista puede realizar esta accion', status=403)
    return None


def _ensure_superadmin(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)
    if not getattr(request.user, 'is_superuser', False):
        return _bad_request('solo superadmin puede realizar esta accion', status=403)
    return None


def _save_model(instance):
    try:
        instance.full_clean()
    except ValidationError as e:
        messages = []
        for field, errors in e.message_dict.items():
            messages.append(f'{field}: {", ".join(errors)}')
        return _bad_request('; '.join(messages))
    instance.save()
    return None


def _build_unique_slug(nombre, explicit_slug=None, exclude_producto_id=None):
    base = slugify(explicit_slug or nombre or '')
    if not base:
        base = 'producto'

    qs = Producto.objects.all()
    if exclude_producto_id:
        qs = qs.exclude(id=exclude_producto_id)

    candidate = base
    counter = 2
    while qs.filter(slug=candidate).exists():
        candidate = f'{base}-{counter}'
        counter += 1
    return candidate


def _build_unique_simple_slug(model_cls, nombre, explicit_slug=None):
    base = slugify(explicit_slug or nombre or '')
    if not base:
        base = 'item'
    candidate = base
    counter = 2
    while model_cls.objects.filter(slug=candidate).exists():
        candidate = f'{base}-{counter}'
        counter += 1
    return candidate


def _media_redirect_url(request, file_field):
    if not file_field:
        return None
    return reverse('api-public-media', kwargs={'file_path': file_field.name})


def _is_allowed_public_media(file_path: str) -> bool:
    if not file_path or file_path.startswith('/') or '..' in file_path or '\\' in file_path:
        return False
    return file_path.startswith(('categorias/', 'colecciones/', 'productos/'))


@require_GET
def api_public_media(request, file_path):
    if not _is_allowed_public_media(file_path):
        raise Http404('archivo no disponible')

    storage = get_r2_storage()
    try:
        f = storage.open(file_path, 'rb')
        content = f.read()
        f.close()
    except Exception:
        raise Http404('archivo no disponible')

    content_type = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    }.get(Path(file_path).suffix.lower(), 'application/octet-stream')

    response = HttpResponse(content, content_type=content_type)
    response['Cache-Control'] = 'public, max-age=86400, immutable'
    return response


def _send_resend_email(*, subject, text, recipients, reply_to=None, html=None, attachments=None):
    if not settings.RESEND_API_KEY:
        return JsonResponse(
            {'ok': False, 'message': 'Falta RESEND_API_KEY en la configuracion'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    payload = {
        'from': settings.RESEND_FROM_EMAIL,
        'to': recipients,
        'subject': subject,
        'text': text,
    }
    if html:
        payload['html'] = html
    if attachments:
        payload['attachments'] = attachments
    if reply_to:
        payload['reply_to'] = reply_to

    response = requests.post(
        'https://api.resend.com/emails',
        headers={
            'Authorization': f'Bearer {settings.RESEND_API_KEY}',
            'Content-Type': 'application/json',
        },
        json=payload,
        timeout=settings.EMAIL_TIMEOUT,
    )
    response.raise_for_status()
    return None


def _build_verification_email_html(request, user, verify_url):
    site_url = request.build_absolute_uri('/')[:-1]
    support_email = settings.CONTACT_MAIL_SOPORTE
    return f'''
    <div style="margin:0;padding:0;background:#f0dbdb;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Verifica tu correo para activar tu cuenta en Constant Archivos Digitales.
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0dbdb;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;border-collapse:collapse;background:#fffaf5;border:1px solid #e8dfd7;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(36,50,51,.14);">
              <tr>
                <td style="background:linear-gradient(135deg,#243233 0%,#35494a 100%);padding:28px 24px;text-align:center;">
                  <img src="cid:logo-email" alt="Constant Archivos Digitales" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
                </td>
              </tr>
              <tr>
                <td style="padding:34px 28px 30px;font-family:Georgia,'Times New Roman',serif;color:#243233;">
                  <div style="display:inline-block;padding:6px 12px;margin-bottom:18px;border-radius:999px;background:#d8e5dc;color:#243233;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Verificación de cuenta</div>
                  <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;font-weight:700;">Hola {user.first_name or user.username}</h1>
                  <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#2f3f40;">Gracias por registrarte. Para activar tu cuenta y completar el acceso a tu perfil, haz clic en el botón de abajo.</p>
                  <div style="text-align:center;margin:28px 0 26px;">
                    <a href="{verify_url}" style="display:inline-block;background:#243233;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 24px;border-radius:999px;box-shadow:0 10px 24px rgba(36,50,51,.22);">Verificar correo</a>
                  </div>
                  <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#536162;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#243233;">{verify_url}</p>
                  <hr style="border:0;border-top:1px solid #e8dfd7;margin:28px 0;" />
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#6b5f58;">Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
                  <div style="margin-top:28px;padding:18px 18px 16px;background:linear-gradient(180deg,#f7f1ea 0%,#fbf7f2 100%);border:1px solid #e8dfd7;border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.7);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td valign="top" width="62" style="padding-right:14px;">
                          <div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#243233 0%,#3b5152 100%);color:#fff;font-family:Arial,sans-serif;font-size:18px;font-weight:700;line-height:52px;text-align:center;letter-spacing:.08em;box-shadow:0 10px 18px rgba(36,50,51,.18);">CAD</div>
                        </td>
                        <td valign="top" style="font-family:Georgia,'Times New Roman',serif;color:#243233;">
                          <p style="margin:0 0 6px;font-size:14px;line-height:1.5;font-weight:700;">Saludos,</p>
                          <p style="margin:0 0 10px;font-size:15px;line-height:1.5;">Equipo de Constant Archivos Digitales</p>
                          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b5f58;">Soporte: <a href="mailto:{support_email}" style="color:#243233;text-decoration:underline;">{support_email}</a></p>
                          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b5f58;">Web: <a href="{site_url}" style="color:#243233;text-decoration:underline;">{site_url}</a></p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    '''


@require_GET
def api_root(request):
    return JsonResponse(
        {
            'name': 'webConstAD API',
            'status': 'ok',
            'endpoints': {
                'health': '/api/health/',
                'products': '/api/productos/',
                'categorias': '/api/categorias/',
                'auth_register': '/api/auth/register/',
                'auth_login': '/api/auth/login/',
                'auth_logout': '/api/auth/logout/',
                'auth_session': '/api/auth/session/',
                'auth_verify_email': '/api/auth/verify-email/<uidb64>/<token>/',
                'publicar_producto': '/api/publicar/producto/',
                'contacto': '/api/contacto/',
                'descargar_producto': '/api/productos/<slug>/download/',
            },
        }
    )


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_contacto(request):
    serializer = MensajeContactoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    mensaje = serializer.save()

    destinatario = (
        settings.CONTACT_MAIL_CONTACTO
        if mensaje.motivo == MensajeContacto.MOTIVO_CONTACTO
        else settings.CONTACT_MAIL_SOPORTE
    )
    asunto = f'Nuevo mensaje de {mensaje.get_motivo_display()}: {mensaje.nombre}'
    cuerpo = (
        f'Nombre: {mensaje.nombre}\n'
        f'Email: {mensaje.email}\n'
        f'Motivo: {mensaje.get_motivo_display()}\n\n'
        f'{mensaje.mensaje}'
    )

    try:
        error = _send_resend_email(
            subject=asunto,
            text=cuerpo,
            recipients=[destinatario],
            reply_to=mensaje.email,
        )
        if error:
            return error
        logger.info('Correo de contacto enviado con Resend a %s', destinatario)
    except Exception:
        logger.exception('Error al enviar correo de contacto')
        return JsonResponse(
            {'ok': False, 'message': 'No se pudo enviar el mensaje'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return JsonResponse(
        {
            'ok': True,
            'message': 'Mensaje enviado correctamente',
            'destinatario': destinatario,
        },
        status=status.HTTP_201_CREATED,
    )


@require_GET
def api_health(request):
    return JsonResponse({'status': 'ok', 'message': 'Django API operativa'})


@require_GET
def api_payment_details(request):
    details = getattr(settings, 'BANK_ACCOUNT_DETAILS', None) or {}
    bank_account = getattr(settings, 'BANK_ACCOUNT', '') or ''
    return JsonResponse({'bank_account': bank_account, 'details': details})


@require_GET
def api_products(request):
    productos = (
        Producto.objects
        .filter(activo=True, es_gratuito=False, coleccion__isnull=False)
        .exclude(precio__isnull=True)
        .order_by('nombre')
    )

    data = [
        {
            'id': p.id,
            'nombre': p.nombre,
            'slug': p.slug,
            'descripcion': p.descripcion,
            'descripcion_imagen': _media_redirect_url(request, p.descripcion_imagen),
            'precio': p.precio if p.precio is not None else None,
            'es_gratuito': p.es_gratuito,
            'paginas': p.paginas,
            'activo': p.activo,
            'imagen': _media_redirect_url(request, p.imagen),
            'preview_imagen': _media_redirect_url(request, p.preview_imagen),
            'categoria_id': p.categoria_id,
            'coleccion': p.coleccion.nombre if p.coleccion else None,
            'coleccion_id': p.coleccion_id,
        }
        for p in productos
    ]

    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_producto_detalle(request, slug):
    producto = get_object_or_404(
        Producto,
        slug=slug,
        activo=True,
        es_gratuito=False,
        coleccion__isnull=False,
        precio__isnull=False,
    )

    return JsonResponse(
        {
            'id': producto.id,
            'nombre': producto.nombre,
            'slug': producto.slug,
            'descripcion': producto.descripcion,
            'descripcion_imagen': _media_redirect_url(request, producto.descripcion_imagen),
            'precio': producto.precio if producto.precio is not None else None,
            'es_gratuito': producto.es_gratuito,
            'paginas': producto.paginas,
            'activo': producto.activo,
            'imagen': _media_redirect_url(request, producto.imagen),
            'preview_imagen': _media_redirect_url(request, producto.preview_imagen),
            'categoria_id': producto.categoria_id,
            'coleccion': producto.coleccion.nombre if producto.coleccion else None,
            'coleccion_id': producto.coleccion_id,
        }
    )


@require_GET
def api_categorias(request):
    categorias = Categoria.objects.filter(es_gratuita=True)
    data = [
        {
            'id': c.id,
            'nombre': c.nombre,
            'slug': c.slug,
            'descripcion': c.descripcion,
            'imagen': _media_redirect_url(request, c.imagen),
        }
        for c in categorias
    ]
    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_catalog_categorias(request):
    categorias = Categoria.objects.order_by('nombre')
    data = [
        {
            'id': c.id,
            'nombre': c.nombre,
            'slug': c.slug,
            'es_gratuita': c.es_gratuita,
        }
        for c in categorias
    ]
    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_catalog_colecciones(request):
    colecciones = Coleccion.objects.order_by('nombre')
    data = [
        {
            'id': c.id,
            'nombre': c.nombre,
            'slug': c.slug,
            'imagen': _media_redirect_url(request, c.imagen),
        }
        for c in colecciones
    ]
    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_categoria_productos(request, slug):
    categoria = get_object_or_404(Categoria, slug=slug, es_gratuita=True)
    productos = (
        Producto.objects.filter(categoria=categoria, activo=True)
        .order_by('nombre')
    )

    data = {
        'categoria': {
            'id': categoria.id,
            'nombre': categoria.nombre,
            'slug': categoria.slug,
            'descripcion': categoria.descripcion,
            'imagen': _media_redirect_url(request, categoria.imagen),
        },
        'count': productos.count(),
        'results': [
            {
                'id': p.id,
                'nombre': p.nombre,
                'slug': p.slug,
                'descripcion': p.descripcion,
                'descripcion_imagen': _media_redirect_url(request, p.descripcion_imagen),
                'precio': p.precio if p.precio is not None else None,
                'es_gratuito': p.es_gratuito,
                'paginas': p.paginas,
                'activo': p.activo,
                'imagen': _media_redirect_url(request, p.imagen),
                'preview_imagen': _media_redirect_url(request, p.preview_imagen),
                'categoria_id': p.categoria_id,
                'coleccion_id': p.coleccion_id,
            }
            for p in productos
        ],
    }
    return JsonResponse(data)


@require_GET
def api_auth_csrf(request):
    token = get_token(request)
    return JsonResponse({'ok': True, 'csrfToken': token})


@require_http_methods(['POST'])
def api_auth_register(request):
    username = (request.POST.get('username') or '').strip()
    password = request.POST.get('password') or ''
    email = (request.POST.get('email') or '').strip()
    first_name = (request.POST.get('nombre') or '').strip()
    last_name = (request.POST.get('apellido') or '').strip()
    pais = (request.POST.get('pais') or '').strip()

    if not username or not password or not email:
        return _bad_request('username, email y password son obligatorios')
    if not first_name or not last_name or not pais:
        return _bad_request('nombre, apellido y pais son obligatorios')
    if len(password) < 8:
        return _bad_request('password debe tener al menos 8 caracteres')

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return _bad_request('username ya existe')
    if User.objects.filter(email__iexact=email).exists():
        return _bad_request('email ya existe')

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_active=False,
    )

    cliente_group = Group.objects.filter(name__iexact='Cliente').first()
    if cliente_group:
        user.groups.add(cliente_group)

    perfil = user.perfil_cliente
    perfil.nombre = first_name
    perfil.apellido = last_name
    perfil.pais = pais
    perfil.save(update_fields=['nombre', 'apellido', 'pais'])

    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(str(user.pk).encode())
    verify_url = request.build_absolute_uri(f'/verificar-cuenta/{uidb64}/{token}/')
    asunto = 'Verifica tu correo'
    cuerpo = (
        f'Hola {first_name},\n\n'
        'Gracias por registrarte. Para activar tu cuenta y completar el alta, abre este enlace:\n\n'
        f'{verify_url}\n\n'
        'Si no creaste esta cuenta, puedes ignorar este mensaje.'
    )
    html = _build_verification_email_html(request, user, verify_url)
    logo_path = settings.BASE_DIR / 'web' / 'static' / 'web' / 'assets' / 'logo-email.png'
    attachments = []
    if logo_path.exists():
        attachments.append({
            'filename': 'logo-email.png',
            'content': base64.b64encode(logo_path.read_bytes()).decode('ascii'),
            'content_type': 'image/png',
            'content_id': 'logo-email',
        })

    try:
        error = _send_resend_email(
            subject=asunto,
            text=cuerpo,
            recipients=[user.email],
            html=html,
            attachments=attachments,
        )
        if error:
            user.delete()
            return error
        logger.info('Correo de verificacion enviado con Resend a %s', user.email)
    except Exception:
        logger.exception('Error al enviar correo de verificacion')
        user.delete()
        return JsonResponse(
            {'ok': False, 'message': 'No se pudo enviar el correo de verificacion'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return JsonResponse(
        {
            'ok': True,
            'message': 'Cuenta creada. Revisa tu correo para verificarla.',
        },
        status=201,
    )


@require_GET
def api_auth_verify_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = get_user_model().objects.get(pk=uid)
    except (ValueError, TypeError, OverflowError, get_user_model().DoesNotExist):
        return _bad_request('enlace de verificacion invalido', status=400)

    if not default_token_generator.check_token(user, token):
        return _bad_request('enlace de verificacion invalido o expirado', status=400)

    if not user.is_active:
        user.is_active = True
        user.save(update_fields=['is_active'])

    login(request, user)
    request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    return JsonResponse(
        {
            'ok': True,
            'message': 'Correo verificado correctamente',
            'user': _serialize_user(user),
        }
    )


@require_GET
def api_auth_verify_page(request, uidb64, token):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(f'/verificar-cuenta/{uidb64}/{token}/?status=success')
    return HttpResponseRedirect('/')


@require_http_methods(['POST'])
def api_suscriptor_anonimo_crear(request):
    email = (request.POST.get('email') or '').strip().lower()
    if not email:
        return _bad_request('email es obligatorio')

    suscriptor, created = SuscriptorAnonimo.objects.get_or_create(email=email)
    return JsonResponse({'ok': True, 'created': created, 'email': suscriptor.email})


@require_http_methods(['POST'])
def api_auth_login(request):
    username = (request.POST.get('username') or '').strip()
    password = request.POST.get('password') or ''

    if not username or not password:
        return _bad_request('username y password son obligatorios')

    login_identifier = username
    matched_user = None
    if '@' in username:
        User = get_user_model()
        matched_user = User.objects.filter(email__iexact=username).first()
        if matched_user:
            login_identifier = matched_user.username
    else:
        User = get_user_model()
        matched_user = User.objects.filter(username=username).first()

    if matched_user and not matched_user.is_active:
        return _bad_request('debes verificar tu correo antes de iniciar sesion', status=403)

    user = authenticate(request, username=login_identifier, password=password)
    if not user:
        return _bad_request('credenciales inválidas', status=401)

    login(request, user)
    request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    return JsonResponse(
        {
            'ok': True,
            'user': _serialize_user(user),
        }
    )


@require_http_methods(['POST'])
def api_auth_logout(request):
    logout(request)
    return JsonResponse({'ok': True})


@require_GET
def api_auth_session(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})

    request.session.set_expiry(settings.SESSION_COOKIE_AGE)
    return JsonResponse(
        {
            'authenticated': True,
            'user': _serialize_user(request.user),
        }
    )


@require_http_methods(['POST'])
def api_auth_account_update(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    perfil = request.user.perfil_cliente
    nombre = (request.POST.get('nombre') or '').strip()
    apellido = (request.POST.get('apellido') or '').strip()
    pais = (request.POST.get('pais') or '').strip()
    password = request.POST.get('password') or ''
    password_confirm = request.POST.get('password_confirm') or ''

    if not nombre or not apellido or not pais:
        return _bad_request('nombre, apellido y pais son obligatorios')

    perfil.nombre = nombre
    perfil.apellido = apellido
    perfil.pais = pais
    perfil.save(update_fields=['nombre', 'apellido', 'pais'])

    if password or password_confirm:
        if password != password_confirm:
            return _bad_request('las contrasenas no coinciden')
        if len(password) < 8:
            return _bad_request('password debe tener al menos 8 caracteres')
        request.user.set_password(password)
        request.user.save(update_fields=['password'])
        login(request, request.user)
        request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    return JsonResponse({'ok': True, 'user': _serialize_user(request.user)})


@require_GET
def api_admin_productos(request):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    productos = Producto.objects.order_by('-created_at', '-id')
    data = [
        {
            'id': p.id,
            'nombre': p.nombre,
            'slug': p.slug,
            'descripcion': p.descripcion,
            'descripcion_imagen': _media_redirect_url(request, p.descripcion_imagen),
            'precio': p.precio if p.precio is not None else '',
            'es_gratuito': p.es_gratuito,
            'paginas': p.paginas,
            'activo': p.activo,
            'imagen': _media_redirect_url(request, p.imagen),
            'preview_imagen': _media_redirect_url(request, p.preview_imagen),
            'archivo': p.archivo.url if p.archivo else None,
            'categoria_id': p.categoria_id,
            'categoria_nombre': p.categoria.nombre if p.categoria else None,
            'coleccion_id': p.coleccion_id,
            'coleccion_nombre': p.coleccion.nombre if p.coleccion else None,
        }
        for p in productos
    ]
    return JsonResponse({'count': len(data), 'results': data})


@require_http_methods(['POST'])
def api_admin_producto_editar(request, producto_id):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    producto = get_object_or_404(Producto, id=producto_id)

    nombre = (request.POST.get('nombre') or producto.nombre).strip()
    descripcion = (request.POST.get('descripcion') or '').strip()
    precio_raw = (request.POST.get('precio') or '').strip()
    es_gratuito = _parse_bool(request.POST.get('es_gratuito'), default=producto.es_gratuito)
    paginas_raw = (request.POST.get('paginas') or '').strip()
    activo = _parse_bool(request.POST.get('activo'), default=producto.activo)
    categoria_id = (request.POST.get('categoria_id') or '').strip()
    coleccion_id = (request.POST.get('coleccion_id') or '').strip()
    explicit_slug = (request.POST.get('slug') or '').strip()

    if not nombre:
        return _bad_request('nombre es obligatorio')

    precio = None
    if not es_gratuito:
        if not precio_raw:
            return _bad_request('precio es obligatorio para productos de pago')
        try:
            precio = int(precio_raw)
        except (TypeError, ValueError):
            return _bad_request('precio invalido')

    paginas = None
    if paginas_raw:
        try:
            paginas = int(paginas_raw)
        except ValueError:
            return _bad_request('paginas invalido')

    categoria = None
    coleccion = None
    if es_gratuito:
        if categoria_id:
            categoria = get_object_or_404(Categoria, pk=categoria_id)
    else:
        if coleccion_id:
            coleccion = get_object_or_404(Coleccion, pk=coleccion_id)

    producto.nombre = nombre
    producto.slug = _build_unique_slug(nombre, explicit_slug=explicit_slug, exclude_producto_id=producto.id)
    producto.descripcion = descripcion
    producto.es_gratuito = es_gratuito
    producto.precio = precio
    producto.paginas = paginas
    producto.activo = activo
    producto.categoria = categoria
    producto.coleccion = coleccion

    if 'imagen' in request.FILES:
        producto.imagen = request.FILES['imagen']
    if 'descripcion_imagen' in request.FILES:
        producto.descripcion_imagen = request.FILES['descripcion_imagen']
    if 'preview_imagen' in request.FILES:
        producto.preview_imagen = request.FILES['preview_imagen']
    if 'archivo' in request.FILES:
        producto.archivo = request.FILES['archivo']

    err = _save_model(producto)
    if err:
        return err
    return JsonResponse({'ok': True})


@require_http_methods(['POST'])
def api_admin_producto_eliminar(request, producto_id):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    producto = get_object_or_404(Producto, id=producto_id)
    producto.delete()
    return JsonResponse({'ok': True})


@require_http_methods(['POST'])
def api_admin_catalogo_crear(request):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    tipo = (request.POST.get('tipo') or '').strip().lower()
    nombre = (request.POST.get('nombre') or '').strip()
    slug_raw = (request.POST.get('slug') or '').strip()
    descripcion = (request.POST.get('descripcion') or '').strip()

    if tipo not in {'categoria', 'coleccion'}:
        return _bad_request('tipo invalido')
    if not nombre:
        return _bad_request('nombre es obligatorio')


    if tipo == 'categoria':
        item = Categoria(
            nombre=nombre,
            slug=_build_unique_simple_slug(Categoria, nombre, explicit_slug=slug_raw),
            descripcion=descripcion,
            es_gratuita=_parse_bool(request.POST.get('es_gratuita'), default=True),
        )
        if 'imagen' in request.FILES:
            item.imagen = request.FILES['imagen']
        err = _save_model(item)
        if err:
            return err
        return JsonResponse({'ok': True, 'tipo': 'categoria', 'id': item.id, 'nombre': item.nombre})

    item = Coleccion(
        nombre=nombre,
        slug=_build_unique_simple_slug(Coleccion, nombre, explicit_slug=slug_raw),
    )
    if 'imagen' in request.FILES:
        item.imagen = request.FILES['imagen']
    err = _save_model(item)
    if err:
        return err
    return JsonResponse({'ok': True, 'tipo': 'coleccion', 'id': item.id, 'nombre': item.nombre})


@require_http_methods(['POST'])
def api_admin_catalogo_editar(request, tipo, item_id):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    tipo = (tipo or '').strip().lower()
    nombre = (request.POST.get('nombre') or '').strip()
    descripcion = (request.POST.get('descripcion') or '').strip()
    if not nombre:
        return _bad_request('nombre es obligatorio')


    if tipo == 'categoria':
        item = get_object_or_404(Categoria, id=item_id)
        item.nombre = nombre
        item.descripcion = descripcion
        item.es_gratuita = _parse_bool(request.POST.get('es_gratuita'), default=item.es_gratuita)
        item.slug = _build_unique_simple_slug(Categoria, nombre, explicit_slug=request.POST.get('slug') or item.slug)
        if 'imagen' in request.FILES:
            item.imagen = request.FILES['imagen']
        err = _save_model(item)
        if err:
            return err
        return JsonResponse({'ok': True})

    if tipo == 'coleccion':
        item = get_object_or_404(Coleccion, id=item_id)
        item.nombre = nombre
        item.slug = _build_unique_simple_slug(Coleccion, nombre, explicit_slug=request.POST.get('slug') or item.slug)
        if 'imagen' in request.FILES:
            item.imagen = request.FILES['imagen']
        if 'descripcion' in request.FILES:
            item.descripcion = request.FILES['descripcion']
        err = _save_model(item)
        if err:
            return err
        return JsonResponse({'ok': True})

    return _bad_request('tipo invalido')


@require_http_methods(['POST'])
def api_admin_catalogo_eliminar(request, tipo, item_id):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    tipo = (tipo or '').strip().lower()

    if tipo == 'categoria':
        item = get_object_or_404(Categoria, id=item_id)
        item.delete()
        return JsonResponse({'ok': True})

    if tipo == 'coleccion':
        item = get_object_or_404(Coleccion, id=item_id)
        item.delete()
        return JsonResponse({'ok': True})

    return _bad_request('tipo invalido')


@require_http_methods(['POST'])
def api_publicar_producto(request):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    nombre = (request.POST.get('nombre') or '').strip()
    slug = (request.POST.get('slug') or '').strip()
    descripcion = (request.POST.get('descripcion') or '').strip()
    precio_raw = (request.POST.get('precio') or '').strip()
    es_gratuito = _parse_bool(request.POST.get('es_gratuito'), default=False)
    paginas = request.POST.get('paginas')
    activo = _parse_bool(request.POST.get('activo'), default=True)
    categoria_id = request.POST.get('categoria_id')
    coleccion_id = request.POST.get('coleccion_id')

    if not nombre:
        return _bad_request('nombre es obligatorio')

    if not es_gratuito and not precio_raw:
        return _bad_request('precio es obligatorio para productos de pago')

    precio = None
    if precio_raw:
        try:
            precio = int(precio_raw)
        except (TypeError, ValueError):
            return _bad_request('precio invalido')

    categoria = None
    if categoria_id:
        categoria = get_object_or_404(Categoria, pk=categoria_id)

    coleccion = None
    if coleccion_id:
        coleccion = get_object_or_404(Coleccion, pk=coleccion_id)

    producto = Producto(
        nombre=nombre,
        slug=_build_unique_slug(nombre, explicit_slug=slug),
        descripcion=descripcion,
        precio=precio,
        es_gratuito=es_gratuito,
        paginas=int(paginas) if paginas else None,
        activo=activo,
        categoria=categoria,
        coleccion=coleccion,
    )

    if 'imagen' in request.FILES:
        producto.imagen = request.FILES['imagen']
    if 'descripcion_imagen' in request.FILES:
        producto.descripcion_imagen = request.FILES['descripcion_imagen']
    if 'preview_imagen' in request.FILES:
        producto.preview_imagen = request.FILES['preview_imagen']
    if 'archivo' in request.FILES:
        producto.archivo = request.FILES['archivo']

    err = _save_model(producto)
    if err:
        return err

    return JsonResponse(
        {
            'ok': True,
            'producto': {
                'id': producto.id,
                'nombre': producto.nombre,
                'slug': producto.slug,
                'es_gratuito': producto.es_gratuito,
            'precio': producto.precio if producto.precio is not None else None,
                'imagen': _media_redirect_url(request, producto.imagen),
                'archivo': producto.archivo.url if producto.archivo else None,
            },
        },
        status=201,
    )


@require_GET
def api_producto_download(request, slug):
    producto = get_object_or_404(Producto, slug=slug, activo=True)

    if not producto.archivo:
        return _bad_request('producto sin archivo', status=404)

    if not producto.es_gratuito and not request.user.is_authenticated:
        return _bad_request('login requerido para descargar productos de pago', status=401)

    return HttpResponseRedirect(producto.archivo.url)


@require_GET
def api_cart(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    items = carrito.items.select_related('producto').all()

    items_data = []
    total = 0
    for item in items:
        precio = item.producto.precio or 0
        items_data.append({
            'id': item.id,
            'producto_id': item.producto_id,
            'producto': {
                'id': item.producto.id,
                'nombre': item.producto.nombre,
                'slug': item.producto.slug,
                'precio': precio,
                'imagen': _media_redirect_url(request, item.producto.imagen),
            },
            'subtotal': precio,
        })
        total += precio

    return JsonResponse({
        'items': items_data,
        'total': total,
        'count': len(items_data),
    })


@require_http_methods(['POST'])
def api_cart_add(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    producto_id = request.POST.get('producto_id')
    if not producto_id:
        return _bad_request('producto_id es obligatorio')

    try:
        producto_id = int(producto_id)
    except (TypeError, ValueError):
        return _bad_request('producto_id invalido')

    producto = get_object_or_404(Producto, id=producto_id, activo=True, es_gratuito=False)

    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    item, created = CarritoItem.objects.get_or_create(carrito=carrito, producto=producto)

    return JsonResponse({
        'ok': True,
        'created': created,
        'item_id': item.id,
    }, status=201 if created else 200)


@require_http_methods(['DELETE'])
def api_cart_item_delete(request, item_id):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    item = get_object_or_404(CarritoItem, id=item_id, carrito__usuario=request.user)
    item.delete()

    return JsonResponse({'ok': True})


@require_GET
def api_cart_checkout(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    items = carrito.items.select_related('producto').all()

    items_data = []
    total = 0
    for item in items:
        precio = item.producto.precio or 0
        items_data.append({
            'id': item.id,
            'producto_id': item.producto_id,
            'producto': {
                'id': item.producto.id,
                'nombre': item.producto.nombre,
                'slug': item.producto.slug,
                'precio': precio,
                'imagen': _media_redirect_url(request, item.producto.imagen),
            },
            'subtotal': precio,
        })
        total += precio

    details = getattr(settings, 'BANK_ACCOUNT_DETAILS', None) or {}

    return JsonResponse({
        'items': items_data,
        'total': total,
        'count': len(items_data),
        'details': details,
    })


# ─── FLOW PAYMENT GATEWAY ────────────────────────────────────────────────────


@require_http_methods(['POST'])
def api_flow_create_payment(request):
    if not request.user.is_authenticated:
        return _bad_request('autenticacion requerida', status=401)

    carrito = getattr(request.user, 'carrito', None)
    if not carrito:
        return _bad_request('carrito vacio')
    items = list(carrito.items.select_related('producto').all())
    if not items:
        return _bad_request('carrito vacio')

    total = sum(item.producto.precio or 0 for item in items)
    if total <= 0:
        return _bad_request('monto invalido')

    commerce_order = f"{request.user.id}-{carrito.pk}-{int(time.time())}-{random.randint(1000, 9999)}"
    subject = 'Compra en Constant Archivos Digitales'
    email = request.user.email

    if not email:
        return _bad_request('el usuario debe tener un email registrado')

    optional_data = {
        'user_id': request.user.id,
        'username': request.user.username,
        'items': [
            {'producto_id': item.producto_id, 'nombre': item.producto.nombre}
            for item in items
        ],
    }

    try:
        client = FlowClient()
        result = client.create_payment(
            commerce_order=commerce_order,
            subject=subject,
            amount=total,
            email=email,
            url_confirmation=settings.FLOW_URL_CONFIRMATION,
            url_return=settings.FLOW_URL_RETURN,
            optional=json.dumps(optional_data),
        )
    except FlowError as e:
        return _bad_request(str(e), status=400)

    flow_token = result.get('token', '')
    flow_url = result.get('url', '')

    if not flow_token or not flow_url:
        return _bad_request('Flow no retorno token o url', status=502)

    orden = Orden.objects.create(
        user=request.user,
        estado='pendiente',
        total=total,
        pasarela='flow',
        pasarela_orden_id=flow_token,
        moneda='CLP',
    )
    for item in items:
        OrdenItem.objects.create(
            orden=orden,
            producto=item.producto,
            precio_al_momento=item.producto.precio or 0,
        )

    carrito.items.all().delete()

    redirect_url = f"{flow_url}?token={flow_token}"

    return JsonResponse({
        'ok': True,
        'redirect_url': redirect_url,
        'orden_id': orden.pk,
    })


@csrf_exempt
@require_http_methods(['POST'])
def api_flow_confirmation(request):
    token = request.POST.get('token', '')

    if not token:
        return _bad_request('token es obligatorio')

    try:
        client = FlowClient()
        status_data = client.get_status(token=token)
    except FlowError as e:
        logger.error('Flow confirmation error for token=%s: %s', token[:12], e)
        return _bad_request(str(e), status=502)

    flow_status = status_data.get('status')
    commerce_order = status_data.get('commerceOrder', '')

    try:
        orden = Orden.objects.get(pasarela_orden_id=token, pasarela='flow')
    except Orden.DoesNotExist:
        logger.warning('Flow confirmation: orden no encontrada para token=%s', token[:12])
        return _bad_request('orden no encontrada', status=404)

    if flow_status == 1:
        orden.estado = 'completada'
        orden.save()

        for item in orden.items.select_related('producto').all():
            Descarga.objects.create(
                user=orden.user,
                producto=item.producto,
                token=secrets.token_urlsafe(48),
                expira_en=timezone.now() + timedelta(days=365),
            )
        logger.info('Flow payment completed: orden=%s flowOrder=%s', orden.pk, status_data.get('flowOrder'))
    elif flow_status == 2:
        orden.estado = 'rechazada'
        orden.save()
        logger.info('Flow payment rejected: orden=%s', orden.pk)
    elif flow_status == 3:
        orden.estado = 'cancelada'
        orden.save()
        logger.info('Flow payment cancelled: orden=%s', orden.pk)
    else:
        logger.info('Flow payment status=%s for orden=%s', flow_status, orden.pk)

    return JsonResponse({'ok': True})


def api_flow_return(request):
    cuenta_url = '/cuenta/'
    params = urlencode({'flow': 'procesando'})
    redirect = f"{cuenta_url}?{params}"

    return HttpResponseRedirect(redirect)
