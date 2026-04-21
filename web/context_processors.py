from datetime import datetime
import os


def app_metadata(request):
    raw_version = os.getenv('APP_VERSION', '').strip()
    if raw_version and not raw_version.startswith('v'):
        raw_version = f'v{raw_version}'

    return {
        'current_year': datetime.now().year,
        'app_version': raw_version or 'dev',
    }
