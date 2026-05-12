import ipaddress
from django.conf import settings
from django.http import HttpResponseNotFound

# Vistas exentas de CSRF (webhooks de pasarelas de pago)
_WEBHOOK_CSRF_EXEMPT_PATHS = [
    '/api/pagos/flow/confirmacion/',
]


class FlowWebhookCsrfExemptMiddleware:
    """Exime de CSRF los endpoints de webhook de Flow.
    Debe ejecutarse *antes* de CsrfViewMiddleware en MIDDLEWARE."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path_info in _WEBHOOK_CSRF_EXEMPT_PATHS:
            request._dont_enforce_csrf_checks = True
        return self.get_response(request)


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
