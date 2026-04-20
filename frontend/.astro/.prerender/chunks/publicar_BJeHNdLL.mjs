import { c as createComponent, $ as $$BaseLayout, r as renderScript } from './BaseLayout_C8VcIunR.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_DuJfP0Jx.mjs';

const $$Publicar = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Publicar - Constant Archivos Digitales", "page": "publicar" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>PUBLICAR</h2> <p class="lead">Sube productos gratis o de pago desde un solo formulario.</p> </section> <section class="products-hero text-block account-page-card" data-publicar-section> <p data-publicar-loading>Cargando formulario...</p> <form class="auth-form" data-publicar-form hidden> <label for="pub-nombre">Nombre</label> <input id="pub-nombre" name="nombre" type="text" required> <input id="pub-slug" name="slug" type="text" hidden> <label for="pub-descripcion">Descripción</label> <textarea id="pub-descripcion" name="descripcion" rows="4"></textarea> <label for="pub-es-gratuito">¿Es gratuito?</label> <select id="pub-es-gratuito" name="es_gratuito" required> <option value="false" selected>No (de pago)</option> <option value="true">Sí (gratis)</option> </select> <label for="pub-precio" data-price-label>Precio</label> <input id="pub-precio" name="precio" type="number" min="0" step="0.01" placeholder="10000"> <label for="pub-paginas">Páginas (opcional)</label> <input id="pub-paginas" name="paginas" type="number" min="1" step="1"> <label for="pub-activo">¿Activo?</label> <select id="pub-activo" name="activo" required> <option value="true" selected>Sí</option> <option value="false">No</option> </select> <div data-categoria-block> <label for="pub-categoria">Categoría (para gratis)</label> <select id="pub-categoria" name="categoria_id"> <option value="">Sin categoría</option> </select> </div> <div data-coleccion-block> <label for="pub-coleccion">Colección (para pago)</label> <select id="pub-coleccion" name="coleccion_id"> <option value="">Sin colección</option> </select> </div> <label for="pub-imagen">Imagen (preview)</label> <input id="pub-imagen" name="imagen" type="file" accept="image/*"> <label for="pub-archivo">Archivo (producto)</label> <input id="pub-archivo" name="archivo" type="file"> <button class="btn" type="submit">Publicar producto</button> </form> <div class="publicar-list" data-publicar-list hidden> <h3>Productos publicados</h3> <div data-publicar-items></div> </div> <p class="auth-message" data-publicar-message aria-live="polite"></p> </section> <div class="global-loading-modal" data-global-loading hidden> <div class="global-loading-modal__backdrop"></div> <div class="global-loading-modal__panel"> <span class="loading-spinner" aria-hidden="true"></span> <p>Procesando...</p> </div> </div> </main> ` })} ${renderScript($$result, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/publicar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/publicar.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/publicar.astro";
const $$url = "/publicar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Publicar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
