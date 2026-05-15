#!/bin/sh
set -e

python manage.py migrate --noinput

gunicorn webConstAD.wsgi:application --config /app/docker/gunicorn.conf.py \
  --workers "${GUNICORN_WORKERS:-3}" \
  --threads "${GUNICORN_THREADS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-120}" &

python - <<'PY'
import time
import urllib.request

url = "http://127.0.0.1:8000/api/health/"
for _ in range(60):
    try:
        with urllib.request.urlopen(url, timeout=2) as resp:
            if resp.status == 200:
                raise SystemExit(0)
    except Exception:
        time.sleep(1)
raise SystemExit("Gunicorn did not become ready in time")
PY

HOST=0.0.0.0 PORT=3000 node /app/frontend/dist/server/entry.mjs &

python manage.py collectstatic --noinput

export ADMIN_URL="${ADMIN_URL:-admin}"

# Generar htpasswd solo si el template de nginx usa auth_basic (staging)
if grep -qF 'auth_basic' /etc/nginx/conf.d/default.conf.template; then
    python -c "
import crypt, os, warnings
user = os.environ.get('AUTH_USER', '')
password = os.environ.get('AUTH_PASSWORD', '')
if user and password:
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    salt = crypt.mksalt(crypt.METHOD_APR1)
    hashed = crypt.crypt(password, salt)
    with open('/etc/nginx/.htpasswd', 'w') as f:
        f.write(f'{user}:{hashed}\n')
    print(f'Auth enabled for user: {user}')
else:
    import secrets
    fallback_user = 'admin'
    fallback_pass = secrets.token_urlsafe(16)
    salt = crypt.mksalt(crypt.METHOD_APR1)
    hashed = crypt.crypt(fallback_pass, salt)
    with open('/etc/nginx/.htpasswd', 'w') as f:
        f.write(f'{fallback_user}:{hashed}\n')
    print(f'WARNING: AUTH_USER/AUTH_PASSWORD not set. Generated random credentials: {fallback_user} / {fallback_pass}')
"
fi

VARS='${ADMIN_URL}'
if grep -qF '${MAGIC_DNS_NAME}' /etc/nginx/conf.d/default.conf.template; then
    if [ -z "$MAGIC_DNS_NAME" ]; then
        echo "ERROR: MAGIC_DNS_NAME must be set for this config" >&2
        exit 1
    fi
    VARS='${ADMIN_URL} ${MAGIC_DNS_NAME}'
fi

envsubst "$VARS" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
