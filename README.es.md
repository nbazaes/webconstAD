# webConstAD

webConstAD es una plataforma web de recursos de ilustracion digital. Combina:

- un backend en Django (API y autenticacion)
- un frontend en Astro (paginas estaticas)
- PostgreSQL para persistencia
- Nginx + Gunicorn en Docker para servir la aplicacion

El sitio incluye paginas publicas (inicio, productos, guia de uso, recursos gratuitos y contacto), acceso a cuenta y flujos de publicacion para administradores.

## Construccion y ejecucion con Docker

### 1) Requisitos

- Docker
- Plugin de Docker Compose

### 2) Configurar entorno

Crea o actualiza el archivo `.env` en la raiz del proyecto (`webConstAD/webConstAD`) con tus valores.

Variables minimas usadas por este stack:

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

### 3) Construir e iniciar

Desde `webConstAD/webConstAD`:

```bash
docker compose up -d --build
```

### 4) Abrir el sitio

La aplicacion queda disponible en:

- `http://localhost`

### 5) Comandos utiles

```bash
docker compose logs -f web
docker compose logs -f db
docker compose restart web
docker compose down
```

## Licencia

Este proyecto esta licenciado bajo la GNU General Public License v3.0.
Consulta `LICENSE` para ver el texto completo.
