import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_DizXBAC_.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_DjbYDvPF.mjs';

const $$Canva = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Canva;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Canva - Constant Archivos Digitales", "page": "canva" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>CANVA</h2> <p class="lead">Area en preparacion para plantillas editables y recursos de diseno.</p> <p>
La estructura base ya esta migrada a Astro. En el siguiente paso puedes agregar modulos
        interactivos con islas React solo donde haga falta.
</p> </section> </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/canva.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/canva.astro";
const $$url = "/canva";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Canva,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
