# AGENTS.md

## Stack
- **Backend:** Django 6.0.3 + DRF, PostgreSQL, Gunicorn (port 8000)
- **Frontend:** Astro 6.1.7 with `@astrojs/node` adapter running as standalone server (port 3000)
- **Storage:** Cloudflare R2 (django-storages + boto3), not local media
- **Prod:** Docker + Nginx proxies `/api/` → Django, `/` → Astro, `/{ADMIN_URL}/` → Django

## Project layout
- `webConstAD/` — Django project config (settings, wsgi)
- `web/` — main Django app (models, views, urls)
- `frontend/` — Astro app, build output: `dist/server/entry.mjs` (server) + `dist/client/` (static)
- `docker/` — nginx templates, gunicorn config, entrypoint.sh

## Commands
- Frontend dev: `cd frontend && npm run dev` (default port 4321)
- Frontend build: `cd frontend && npm run build`
- Django: `python manage.py <command>` (migrate, runserver, etc.)
- Docker prod: `docker compose -f docker-compose.prod.yml up -d`
- Docker staging: `docker compose -f docker-compose.staging.yml up -d`

## Architecture quirks
- **Frontend builds at container startup**, not at image build time (see `docker/entrypoint.sh`)
- Admin panel URL is set via `ADMIN_URL` env var (default: `admin`), nginx template uses `envsubst`
- Admin access restricted to Tailscale network (`100.64.0.0/10`) via `web/middleware.py`
- Django settings load `.env` via `python-dotenv`
- `CORS_ALLOWED_ORIGINS` includes Astro dev ports 4321 and Vite port 5173
- Static files: Whitenoise in production, `collectstatic` runs at container startup
- Frontend API calls use paths like `/api/...` — proxied by Nginx to Django

## CI/CD
- **Production:** tags matching `v[0-9]+.[0-9]+.[0-9]+` → deploys via SSH
- **Staging:** tags matching `v*-rc.*` → deploys via SSH
- Both do `git fetch --all --tags && docker compose build --no-cache && up -d`

## Env vars (see `.env`, `.env.prod`, `.env.staging`)
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `ADMIN_URL`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `R2_ACCESS_KEY`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`
- `APP_VERSION` set by CI via build arg

## Notes
- No tests exist (`web/tests.py` is empty), no lint/typecheck config
- No `opencode.json` or other agent instruction files present
