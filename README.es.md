# webConstAD

Plataforma web construida para **[Constant Archivos Digitales](https://constantdigitales.com)**, una tienda de ilustración digital de la diseñadora Jenny Constant. El sitio permite a los clientes explorar, comprar y descargar archivos listos para imprimir o dibujar digitalmente.

![Constant Archivos Digitales](docs/preview.png)

## Stack

- **Backend:** Django + Django REST Framework (API REST, autenticación, panel admin)
- **Frontend:** Astro con SSR (servidor standalone via `@astrojs/node`)
- **Base de datos:** PostgreSQL
- **Storage:** Cloudflare R2 (archivos multimedia y descargas)

## Estructura del proyecto

```
webConstAD/            # Configuración Django (settings, urls, wsgi)
web/                   # App principal (modelos, vistas, serializers, middleware)
frontend/              # Aplicación Astro (páginas, componentes, estilos)
docker/                # Templates Nginx, config Gunicorn, entrypoint
```

## Infraestructura

La aplicación está completamente contenedorizada. El frontend se buildea al iniciar el contenedor y Nginx actúa como reverse proxy:

- `/` → Astro (puerto 3000)
- `/api/` → Django (puerto 8000)
- `/{ADMIN_URL}/` → Django admin

El panel admin está restringido a la red Tailscale (`100.64.0.0/10`) por seguridad.

### Producción

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Staging

```bash
docker compose -f docker-compose.staging.yml up -d
```

## CI/CD

El despliegue se realiza automáticamente vía SSH al crear tags en GitHub:

- **Producción:** tags `v*.*.*` (ej. `v1.2.3`)
- **Staging:** tags `v*-rc.*` (ej. `v1.2.3-rc.1`)

El pipeline ejecuta `git fetch --all --tags && docker compose build --no-cache && up -d`.

## Desarrollo local

Se recomienda usar Docker Compose para levantar todo el entorno junto (web + base de datos) en vez de correr los servicios por separado:

```bash
docker compose -f docker-compose.dev.yml up
```

Esto inicia Django con `DEBUG=True` y PostgreSQL con volúmenes locales, accesible en el puerto 80.

Si necesitas trabajar en el frontend con hot reload:

```bash
cd frontend && pnpm dev
```

## Licencia

El código fuente de este proyecto está licenciado bajo la [GNU General Public License v3.0](LICENSE).

Todos los archivos multimedia (imágenes, logos, ilustraciones y archivos descargables) contenidos en este repositorio son propiedad intelectual exclusiva de Jenny Constant y **no** están cubiertos por la licencia GPL-3.0. Todos los derechos reservados. Ver [NOTICE](NOTICE) para más detalles.
