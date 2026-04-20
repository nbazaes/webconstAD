import { c as createComponent, $ as $$BaseLayout, r as renderScript } from './BaseLayout_C8VcIunR.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_DuJfP0Jx.mjs';

async function getStaticPaths() {
  const buildApiOrigin = "http://127.0.0.1:8000";
  const res = await fetch(`${buildApiOrigin}/api/catalog/categorias/`);
  const data = await res.json();
  const categorias = (data.results || []).filter((c) => c.es_gratuita);
  return categorias.map((categoria) => ({
    params: { slug: categoria.slug }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Categoria Gratis - Constant Archivos Digitales", "page": "gratis" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2 data-cat-title>Categoria</h2> <p class="lead" data-cat-description hidden></p> </section> <section class="products-grid" data-cat-products hidden></section> <section class="products-hero text-block" data-cat-empty hidden> <p>No hay productos en esta categoría todavía.</p> </section> </main> <div class="download-modal" data-download-modal hidden> <div class="download-modal__backdrop" data-close-modal></div> <div class="download-modal__panel" role="dialog" aria-modal="true" aria-labelledby="download-modal-title"> <h3 id="download-modal-title">Descargar producto</h3> <p data-modal-message></p> <div class="download-modal__actions"> <button type="button" class="btn btn-secondary" data-cancel-download>Cerrar</button> <button type="button" class="btn" data-confirm-download>Descargar</button> </div> <div data-guest-subscription hidden> <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e8d8cc;"> <p><strong>¡Sígueme en Instagram para más!</strong> <a href="https://www.instagram.com/constantdesigns/" target="_blank" rel="noopener">@constantdesigns</a></p> <p style="margin-top: 12px;">¿Quieres recibir notificaciones? Escribe tu correo para recibir las noticias de los nuevos productos.</p> <div class="auth-form" style="gap: 8px;"> <input type="email" placeholder="tu@email.com" data-newsletter-email> <button type="button" class="btn" data-newsletter-save>Guardar correo</button> </div> <p class="auth-message" data-newsletter-status style="margin-top: 8px;"></p> </div> </div> </div> <div class="global-loading-modal" data-global-loading hidden> <div class="global-loading-modal__backdrop"></div> <div class="global-loading-modal__panel"> <span class="loading-spinner" aria-hidden="true"></span> <p>Procesando...</p> </div> </div> ` })} ${renderScript($$result, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/gratis/[slug].astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/gratis/[slug].astro", void 0);
const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/gratis/[slug].astro";
const $$url = "/gratis/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
