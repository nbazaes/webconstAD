import ipaddress
from django.conf import settings
from django.http import HttpResponseNotFound


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
