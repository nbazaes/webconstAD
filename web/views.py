from pathlib import Path
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import Http404, HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .build_status import get_build_state
from .models import Categoria, Coleccion, Producto, SuscriptorAnonimo


FRONTEND_BUILD_DIR = settings.BASE_DIR / 'web' / 'static' / 'frontend'


def _serve_frontend_page(page: str = '') -> HttpResponse:
    target = FRONTEND_BUILD_DIR / page / 'index.html' if page else FRONTEND_BUILD_DIR / 'index.html'
    if not target.exists() or not target.is_file():
        raise Http404('La pagina frontend no existe. Ejecuta el build de Astro.')
    return HttpResponse(target.read_text(encoding='utf-8'))


def home(request):
    return _serve_frontend_page()


def productos(request):
    return _serve_frontend_page('productos')


def uso(request):
    return _serve_frontend_page('uso')


def canva(request):
    return _serve_frontend_page('canva')


def gratis(request):
    return _serve_frontend_page('gratis')


def gratis_categoria(request, slug):
    return _serve_frontend_page('gratis-categoria')


def contacto(request):
    return _serve_frontend_page('contacto')


def cuenta(request):
    return _serve_frontend_page('cuenta')


def publicar(request):
    return _serve_frontend_page('publicar')


def _bad_request(message, status=400):
    return JsonResponse({'ok': False, 'message': message}, status=status)


def _parse_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on', 'si'}


def _user_role(user):
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return 'admin'

    perfil = getattr(user, 'perfil_cliente', None)
    return perfil.rol if perfil else 'cliente'


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
    if _user_role(request.user) != 'admin':
        return _bad_request('solo admin puede realizar esta accion', status=403)
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
                'build_status': '/api/build/status/',
                'auth_register': '/api/auth/register/',
                'auth_login': '/api/auth/login/',
                'auth_logout': '/api/auth/logout/',
                'auth_session': '/api/auth/session/',
                'publicar_producto': '/api/publicar/producto/',
                'descargar_producto': '/api/productos/<slug>/download/',
            },
        }
    )


@require_GET
def api_health(request):
    return JsonResponse({'status': 'ok', 'message': 'Django API operativa'})


@require_GET
def api_build_status(request):
    state = get_build_state()
    return JsonResponse({'ok': True, 'build': state})


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
            'precio': str(p.precio) if p.precio is not None else None,
            'es_gratuito': p.es_gratuito,
            'paginas': p.paginas,
            'activo': p.activo,
            'imagen': p.imagen.url if p.imagen else None,
            'archivo': p.archivo.url if p.archivo else None,
            'categoria_id': p.categoria_id,
            'coleccion': p.coleccion.nombre if p.coleccion else None,
            'coleccion_id': p.coleccion_id,
        }
        for p in productos
    ]

    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_categorias(request):
    categorias = Categoria.objects.filter(es_gratuita=True)
    data = [
        {
            'id': c.id,
            'nombre': c.nombre,
            'slug': c.slug,
            'descripcion': c.descripcion,
            'imagen': c.imagen.url if c.imagen else None,
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
        }
        for c in colecciones
    ]
    return JsonResponse({'count': len(data), 'results': data})


@require_GET
def api_categoria_productos(request, slug):
    categoria = get_object_or_404(Categoria, slug=slug, es_gratuita=True)
    productos = (
        Producto.objects.filter(categoria=categoria, activo=True, es_gratuito=True)
        .order_by('nombre')
    )

    data = {
        'categoria': {
            'id': categoria.id,
            'nombre': categoria.nombre,
            'slug': categoria.slug,
            'descripcion': categoria.descripcion,
            'imagen': categoria.imagen.url if categoria.imagen else None,
        },
        'count': productos.count(),
        'results': [
            {
                'id': p.id,
                'nombre': p.nombre,
                'slug': p.slug,
                'descripcion': p.descripcion,
                'precio': str(p.precio) if p.precio is not None else None,
                'es_gratuito': p.es_gratuito,
                'paginas': p.paginas,
                'activo': p.activo,
                'imagen': p.imagen.url if p.imagen else None,
                'archivo': p.archivo.url if p.archivo else None,
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


@csrf_exempt
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

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    perfil = user.perfil_cliente
    perfil.nombre = first_name
    perfil.apellido = last_name
    perfil.pais = pais
    perfil.save(update_fields=['nombre', 'apellido', 'pais'])

    login(request, user)
    request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    return JsonResponse(
        {
            'ok': True,
            'user': _serialize_user(user),
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(['POST'])
def api_suscriptor_anonimo_crear(request):
    email = (request.POST.get('email') or '').strip().lower()
    if not email:
        return _bad_request('email es obligatorio')

    suscriptor, created = SuscriptorAnonimo.objects.get_or_create(email=email)
    return JsonResponse({'ok': True, 'created': created, 'email': suscriptor.email})


@csrf_exempt
@require_http_methods(['POST'])
def api_auth_login(request):
    username = (request.POST.get('username') or '').strip()
    password = request.POST.get('password') or ''

    if not username or not password:
        return _bad_request('username y password son obligatorios')

    login_identifier = username
    if '@' in username:
        User = get_user_model()
        matched = User.objects.filter(email__iexact=username).first()
        if matched:
            login_identifier = matched.username

    user = authenticate(request, username=login_identifier, password=password)
    if not user:
        return _bad_request('credenciales invalidas', status=401)

    login(request, user)
    request.session.set_expiry(settings.SESSION_COOKIE_AGE)

    return JsonResponse(
        {
            'ok': True,
            'user': _serialize_user(user),
        }
    )


@csrf_exempt
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


@csrf_exempt
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
            'precio': str(p.precio) if p.precio is not None else '',
            'es_gratuito': p.es_gratuito,
            'paginas': p.paginas,
            'activo': p.activo,
            'imagen': p.imagen.url if p.imagen else None,
            'archivo': p.archivo.url if p.archivo else None,
            'categoria_id': p.categoria_id,
            'categoria_nombre': p.categoria.nombre if p.categoria else None,
            'coleccion_id': p.coleccion_id,
            'coleccion_nombre': p.coleccion.nombre if p.coleccion else None,
        }
        for p in productos
    ]
    return JsonResponse({'count': len(data), 'results': data})


@csrf_exempt
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
            precio = Decimal(precio_raw)
        except (InvalidOperation, ValueError):
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
    if 'archivo' in request.FILES:
        producto.archivo = request.FILES['archivo']

    producto.save()
    return JsonResponse({'ok': True})


@csrf_exempt
@require_http_methods(['POST'])
def api_admin_producto_eliminar(request, producto_id):
    admin_error = _ensure_admin(request)
    if admin_error:
        return admin_error

    producto = get_object_or_404(Producto, id=producto_id)
    producto.delete()
    return JsonResponse({'ok': True})


@csrf_exempt
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
        item.save()
        return JsonResponse({'ok': True, 'tipo': 'categoria', 'id': item.id, 'nombre': item.nombre})

    item = Coleccion(
        nombre=nombre,
        slug=_build_unique_simple_slug(Coleccion, nombre, explicit_slug=slug_raw),
        descripcion=descripcion,
    )
    if 'imagen' in request.FILES:
        item.imagen = request.FILES['imagen']
    item.save()
    return JsonResponse({'ok': True, 'tipo': 'coleccion', 'id': item.id, 'nombre': item.nombre})


@csrf_exempt
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
        item.save()
        return JsonResponse({'ok': True})

    if tipo == 'coleccion':
        item = get_object_or_404(Coleccion, id=item_id)
        item.nombre = nombre
        item.descripcion = descripcion
        item.slug = _build_unique_simple_slug(Coleccion, nombre, explicit_slug=request.POST.get('slug') or item.slug)
        if 'imagen' in request.FILES:
            item.imagen = request.FILES['imagen']
        item.save()
        return JsonResponse({'ok': True})

    return _bad_request('tipo invalido')


@csrf_exempt
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


@csrf_exempt
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
            precio = Decimal(precio_raw)
        except (InvalidOperation, ValueError):
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
    if 'archivo' in request.FILES:
        producto.archivo = request.FILES['archivo']

    producto.save()

    return JsonResponse(
        {
            'ok': True,
            'producto': {
                'id': producto.id,
                'nombre': producto.nombre,
                'slug': producto.slug,
                'es_gratuito': producto.es_gratuito,
                'precio': str(producto.precio) if producto.precio is not None else None,
                'imagen': producto.imagen.url if producto.imagen else None,
                'archivo': producto.archivo.url if producto.archivo else None,
            },
        },
        status=201,
    )


@require_GET
def api_producto_download(request, slug):
    producto = get_object_or_404(Producto, slug=slug, activo=True)

    if producto.es_gratuito:
        if not producto.archivo:
            return _bad_request('producto sin archivo', status=404)
        return JsonResponse({'ok': True, 'url': producto.archivo.url, 'requires_auth': False})

    if not request.user.is_authenticated:
        return _bad_request('login requerido para descargar productos de pago', status=401)

    if not producto.archivo:
        return _bad_request('producto sin archivo', status=404)

    return JsonResponse({'ok': True, 'url': producto.archivo.url, 'requires_auth': True})
