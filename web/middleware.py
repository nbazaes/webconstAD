import ipaddress
import logging
from django.conf import settings
from django.http import HttpResponseNotFound

logger = logging.getLogger(__name__)

_WEBHOOK_CSRF_EXEMPT_PATHS = {
    '/api/pagos/flow/confirmacion/',
}


class FlowWebhookCsrfExemptMiddleware:
    """Marca csrf_exempt = True en el callback ANTES que CsrfViewMiddleware
    lo inspeccione en process_view. Más fiable que setear atributos en el request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, callback, callback_args, callback_kwargs):
        if request.path_info in _WEBHOOK_CSRF_EXEMPT_PATHS:
            callback.csrf_exempt = True
            logger.info('CSRF exempt aplicado a %s', request.path_info)
        return None


class AdminTailscaleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.tailscale_net = ipaddress.ip_network('100.64.0.0/10')

    def __call__(self, request):
        if settings.DEBUG:
            return self.get_response(request)

        admin_url = getattr(settings, 'ADMIN_URL', 'admin')
        if request.path_info.startswith('/' + admin_url):
            client_ip = (request.META.get('HTTP_X_REAL_IP', '')
                         or request.META.get('REMOTE_ADDR', ''))
            try:
                ip = ipaddress.ip_address(client_ip)
                if ip not in self.tailscale_net:
                    return HttpResponseNotFound()
            except ValueError:
                return HttpResponseNotFound()

        return self.get_response(request)
