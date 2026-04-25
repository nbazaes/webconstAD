import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_CSLk66v2.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_D7rbcRYH.mjs';

const $$Uso = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Uso | Constant Archivos Digitales", "page": "uso" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>USOS</h2> <p class="lead">
Estos archivos han sido diseñados para que puedas disfrutarlos de dos maneras: <em>impreso</em> o <em>digital</em>.
</p> <h3><em>Uso digital</em></h3> <p>
Puedes utilizar este material directamente en tu tablet o iPad con aplicaciones de dibujo o
        anotación como Procreate, GoodNotes, Notability o similares.
</p> <p><strong>Solo debes:</strong></p> <ol> <li>Descargar el archivo.</li> <li>Importarlo en tu aplicacion.</li> <li>Trabajar sobre las paginas usando tu lapiz digital.</li> </ol> <p><strong>Recomendación para una mejor experiencia:</strong></p> <ul> <li>Usa modo pantalla completa en tu tablet.</li> </ul> <h3><em>Uso impreso</em></h3> <p>Si prefieres trabajar en papel:</p> <ol> <li>Descarga el archivo.</li> <li>Imprime las paginas en tamaño real.</li> <li>Puedes usar papel común o papel de mayor gramaje según tu preferencia.</li> </ol> <p><strong>Recomendación para una mejor experiencia:</strong></p> <ul> <li>Al imprimir, utiliza escala 100% para respetar el diseño original.</li> </ul> <h3><em>Uso personal</em></h3> <p>
Este archivo es para uso personal únicamente. No está permitido redistribuir, revender ni
        compartir el archivo.
</p> <p>Gracias por apoyar el trabajo independiente de ilustración y creación. ✨</p> </section> </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/uso.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/uso.astro";
const $$url = "/uso";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Uso,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
