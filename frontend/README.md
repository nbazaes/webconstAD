# Frontend Astro

Frontend migrado a Astro como base principal. La idea es mantenerlo ligero y, mas adelante, montar islas reactivas para modulos especificos.

## Requisitos

- Node.js 20+
- npm 10+

## Desarrollo

```bash
npm install
npm run dev
```

Astro expone el proyecto en `http://localhost:4321`.

## Build de produccion

```bash
npm run build
npm run preview
```

El build queda en `../web/static/frontend` para integrarlo con Django.
