# webConstAD

Web platform built for **[Constant Archivos Digitales](https://constantdigitales.com)**, a digital illustration shop by designer Jenny Constant. The site lets customers browse, purchase, and download print-ready and digital drawing files.

![Constant Archivos Digitales](docs/preview.png)

## Stack

- **Backend:** Django + Django REST Framework (REST API, authentication, admin panel)
- **Frontend:** Astro with SSR (standalone server via `@astrojs/node`)
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2 (media files and downloads)

## Project structure

```
webConstAD/            # Django config (settings, urls, wsgi)
web/                   # Main app (models, views, serializers, middleware)
frontend/              # Astro app (pages, components, styles)
docker/                # Nginx templates, Gunicorn config, entrypoint
```

## Infrastructure

The app is fully containerized. The frontend builds at container startup and Nginx acts as a reverse proxy:

- `/` → Astro (port 3000)
- `/api/` → Django (port 8000)
- `/{ADMIN_URL}/` → Django admin

The admin panel is restricted to the Tailscale network (`100.64.0.0/10`) for security.

### Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Staging

```bash
docker compose -f docker-compose.staging.yml up -d
```

## CI/CD

Deployment is automated via SSH when tags are pushed to GitHub:

- **Production:** tags `v*.*.*` (e.g. `v1.2.3`)
- **Staging:** tags `v*-rc.*` (e.g. `v1.2.3-rc.1`)

The pipeline runs `git fetch --all --tags && docker compose build --no-cache && up -d`.

## Local development

It's recommended to use Docker Compose to bring up the full environment together (web + database) instead of running services separately:

```bash
docker compose -f docker-compose.dev.yml up
```

This starts Django with `DEBUG=True` and PostgreSQL with local volumes, accessible on port 80.

If you need to work on the frontend with hot reload:

```bash
cd frontend && pnpm dev
```

## License

The source code of this project is licensed under the [GNU General Public License v3.0](LICENSE).

All multimedia assets (images, logos, illustrations, and downloadable files) contained within this repository are the exclusive intellectual property of Jenny Constant and are **not** covered by the GPL-3.0 license. All rights reserved. See [NOTICE](NOTICE) for details.
