import { c as createComponent, $ as $$BaseLayout, r as renderScript } from './BaseLayout_CrX8Fc92.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from './prerender_BB47Iw_p.mjs';

const $$Productos = createComponent(async ($$result, $$props, $$slots) => {
  const buildApiOrigin = "http://127.0.0.1:8000";
  const response = await fetch(`${buildApiOrigin}/api/productos/`);
  const data = await response.json();
  const products = data.results || [];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Productos | Constant Archivos Digitales", "page": "productos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero"> <h2>PRODUCTOS</h2> <p class="lead">Archivos para <em>imprimir</em> o trabajar <em>digitalmente</em></p> </section> ${products.length > 0 ? renderTemplate`<section class="products-grid"> ${products.map((product) => renderTemplate`<article class="product" data-admin-product${addAttribute(product.id, "data-product-id")}${addAttribute(JSON.stringify(product), "data-product-json")}> <img${addAttribute(product.imagen || "/static/web/assets/hero1.svg", "src")}${addAttribute(product.descripcion || product.nombre, "alt")}> <a href="#" class="caption"${addAttribute(product.descripcion || product.nombre, "title")}> ${product.nombre} <span>${product.coleccion || "Coleccion"} · $${product.precio || "-"}</span> </a> <div class="published-actions" data-admin-actions hidden> <button class="btn" type="button" data-edit-product>Editar</button> <button class="btn btn-secondary" type="button" data-delete-product>Eliminar</button> </div> </article>`)} </section>` : renderTemplate`<section class="products-hero text-block"> <p>Aún no hay productos de pago publicados.</p> </section>`} <div class="global-loading-modal" data-global-loading hidden> <div class="global-loading-modal__backdrop"></div> <div class="global-loading-modal__panel"> <span class="loading-spinner" aria-hidden="true"></span> <p>Procesando...</p> </div> </div> </main> ` })} ${renderScript($$result, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/productos.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/productos.astro", void 0);
const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/productos.astro";
const $$url = "/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Productos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
