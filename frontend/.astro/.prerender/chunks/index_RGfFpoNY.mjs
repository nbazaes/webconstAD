import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_DHpzAE-s.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_7Y9ZwfO2.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Inicio - Constant Archivos Digitales", "page": "inicio" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <h2 class="subtitle">Archivos para <em>imprimir</em> o <em>dibujar</em> digitalmente</h2> <section class="showcase"> <article class="card"> <img src="/static/web/assets/hero1.svg" alt="Muestra principal 1" loading="lazy"> </article> <img src="/static/web/assets/path63.svg" alt="" class="decor-dots" aria-hidden="true"> <article class="card"> <img src="/static/web/assets/hero2.svg" alt="Muestra principal 2" loading="lazy"> </article> </section> </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/index.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
