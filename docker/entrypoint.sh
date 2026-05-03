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

npm --prefix /app/frontend run build

HOST=0.0.0.0 PORT=3000 node /app/frontend/dist/server/entry.mjs &

python manage.py collectstatic --noinput

export ADMIN_URL="${ADMIN_URL:-admin}"

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
