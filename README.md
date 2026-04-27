# webConstAD

Web platform built for **[Constant Archivos Digitales](https://wca.nbazaes.app)**, a digital illustration shop by designer Jenny Constant. The site lets customers browse, purchase, and download print-ready and digital drawing files.

![Constant Archivos Digitales](docs/preview.png)

## Stack

- **Backend:** Django (REST API, authentication, admin publishing flow)
- **Frontend:** Astro (static pages, SSG)
- **Database:** PostgreSQL

## Infrastructure

The app is fully containerized and production-ready out of the box:

- **Docker + Docker Compose** for orchestration
- **Nginx + Gunicorn** for serving the application
- **SSL certificate** support included
- Environment configuration via `.env`

## CI/CD

Includes a GitHub Actions workflow for automated deployment on push.

## License

The source code of this project is licensed under the [GNU General Public License v3.0](LICENSE).

All multimedia assets (images, logos, illustrations, and downloadable files) contained within this repository are the exclusive intellectual property of Jenny Constant and are **not** covered by the GPL-3.0 license. All rights reserved. See [NOTICE](NOTICE) for details.
