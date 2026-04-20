import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_DHpzAE-s.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from './prerender_7Y9ZwfO2.mjs';

const $$Gratis = createComponent(async ($$result, $$props, $$slots) => {
  const buildApiOrigin = "http://127.0.0.1:8000";
  const respuesta = await fetch(`${buildApiOrigin}/api/categorias/`);
  const datos = await respuesta.json();
  const categorias = datos.results || [];
  const allCategoriasRes = await fetch(`${buildApiOrigin}/api/catalog/categorias/`);
  const allCategoriasData = await allCategoriasRes.json();
  const categoriasGratis = (allCategoriasData.results || []).filter((c) => c.es_gratuita);
  const categoriasConImagen = new Map(categorias.map((item) => [item.slug, item]));
  const categoriasRender = categoriasGratis.map((item) => {
    const fromList = categoriasConImagen.get(item.slug);
    return {
      ...item,
      descripcion: fromList?.descripcion || "",
      imagen: fromList?.imagen || null
    };
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Gratis - Constant Archivos Digitales", "page": "gratis", "data-astro-cid-abedn53u": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content" data-astro-cid-abedn53u> <section class="products-hero text-block" data-astro-cid-abedn53u> <h2 data-astro-cid-abedn53u>GRATIS</h2> <p class="lead" data-astro-cid-abedn53u>Recursos gratuitos para probar el estilo de trabajo digital e impreso.</p> </section> ${categoriasRender.length > 0 ? renderTemplate`<section class="products-grid" data-astro-cid-abedn53u> ${categoriasRender.map((cat) => renderTemplate`<div class="product" data-astro-cid-abedn53u> <a${addAttribute(`/gratis/${cat.slug}/`, "href")} class="product-link"${addAttribute(cat.descripcion || "", "title")} data-astro-cid-abedn53u> ${cat.imagen ? renderTemplate`<img${addAttribute(cat.imagen, "src")}${addAttribute(cat.descripcion || cat.nombre, "alt")} data-astro-cid-abedn53u>` : renderTemplate`<div class="card" data-astro-cid-abedn53u> <img src="/static/web/assets/g345.png" alt="Sin imagen" data-astro-cid-abedn53u> </div>`} </a> <a${addAttribute(`/gratis/${cat.slug}/`, "href")} class="product-title"${addAttribute(cat.descripcion || "", "title")} data-astro-cid-abedn53u> ${cat.nombre} </a> </div>`)} </section>` : renderTemplate`<section class="products-hero text-block" data-astro-cid-abedn53u> <p data-astro-cid-abedn53u>Próximamente recursos gratuitos.</p> <ul data-astro-cid-abedn53u> <li data-astro-cid-abedn53u>Plantillas de práctica</li> <li data-astro-cid-abedn53u>Mini colecciones de muestra</li> <li data-astro-cid-abedn53u>Recursos estacionales</li> </ul> </section>`} </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/gratis.astro", void 0);
const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/gratis.astro";
const $$url = "/gratis";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Gratis,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
