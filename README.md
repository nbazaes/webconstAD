# webConstAD

webConstAD is a web platform for digital illustration resources. It combines:

- a Django backend (API and auth)
- an Astro frontend (static pages)
- PostgreSQL for persistence
- Nginx + Gunicorn in Docker for serving the app

The site includes public pages (home, products, usage guide, free resources, contact), account access, and admin publishing flows.

## Build and run with Docker

### 1) Requirements

- Docker
- Docker Compose plugin

### 2) Configure environment

Create or update `.env` in the project root (`webConstAD/webConstAD`) with your values.

Minimum variables used by this stack:

```env
DEBUG=False
SECRET_KEY=change-me
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=webconstad
DB_USER=webconstad_user
DB_PASSWORD=change-me
DB_HOST=db
DB_PORT=5432
```

### 3) Build and start

From `webConstAD/webConstAD`:

```bash
docker compose up -d --build
```

### 4) Open the site

The app is exposed on:

- `http://localhost`

### 5) Useful commands

```bash
docker compose logs -f web
docker compose logs -f db
docker compose restart web
docker compose down
```

## License

This project is licensed under the GNU General Public License v3.0.
See `LICENSE` for full details.
