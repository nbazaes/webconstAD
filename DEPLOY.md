# Deploy en VPS (Docker + Gunicorn + Nginx)

Este proyecto se ejecuta en un solo contenedor de aplicacion con:

- Django + Gunicorn (backend)
- Astro build estatico (frontend)
- Nginx como reverse proxy y servidor de assets
- PostgreSQL en contenedor aparte (`db`)

## 1) Preparar servidor

- Instala Docker y Docker Compose plugin.
- Copia el proyecto al VPS.
- Crea `.env` en la raiz del repo usando los valores de ejemplo de este proyecto.

## 2) Variables `.env` requeridas

Minimo recomendado para produccion:

```env
DEBUG=False
SECRET_KEY=cambia-esto-por-una-clave-larga

ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
CSRF_TRUSTED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com

DB_NAME=webconstad
DB_USER=webconstad_user
DB_PASSWORD=super-secreto
DB_HOST=db
DB_PORT=5432

R2_ACCESS_KEY=...
R2_SECRET_ACCESS_KEY=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
```

## 3) Levantar en produccion

Desde la raiz (`webConstAD/webConstAD`):

```bash
docker compose up -d --build
```

Esto ejecuta automaticamente en el contenedor `web`:

1. `python manage.py migrate`
2. espera a que Gunicorn este operativo
3. `npm run build` del frontend Astro
4. `python manage.py collectstatic`
5. deja Nginx sirviendo en puerto `80`

## 4) Comandos utiles

```bash
docker compose logs -f web
docker compose logs -f db
docker compose restart web
docker compose down
```

## 5) Webhook / build de categorias

Cuando se crea/edita una `Categoria`, Django dispara `trigger_build_async()`.
Ese proceso corre `npm run build` dentro del contenedor para regenerar las paginas estaticas relacionadas.

## 6) Recomendacion de proxy externo

Si usas Nginx del host para SSL (Let's Encrypt), apunta el dominio al puerto `80` del VPS.
Si prefieres mantener solo este stack, agrega TLS en Nginx del host y proxya a `127.0.0.1:80`.
