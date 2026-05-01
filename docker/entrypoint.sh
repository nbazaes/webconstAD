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

exec nginx -g "daemon off;"
