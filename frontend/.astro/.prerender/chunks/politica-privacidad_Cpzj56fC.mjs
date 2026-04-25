import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_CSLk66v2.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_D7rbcRYH.mjs';

const $$PoliticaPrivacidad = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Política de privacidad | Constant Archivos Digitales", "page": "politica-privacidad" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>POLITICA DE PRIVACIDAD</h2> <p class="lead">
En Constant Archivos Digitales cuidamos tu información personal y la usamos solo para operar el sitio de forma segura.
</p> <h3>1. ¿Qué datos recopilamos?</h3> <ul> <li>Datos de cuenta: nombre de usuario, email, nombre, apellido y país.</li> <li>Datos técnicos básicos: información de sesión y seguridad para mantener tu cuenta protegida.</li> <li>Si te suscribes al boletín: tu email.</li> </ul> <h3>2. ¿Para qué usamos tus datos?</h3> <ul> <li>Crear y administrar tu cuenta.</li> <li>Permitir inicio de sesión y acceso a descargas.</li> <li>Mejorar el funcionamiento y la seguridad del sitio.</li> <li>Enviar novedades solo si te suscribes voluntariamente.</li> </ul> <h3>3. Qué no hacemos con tus datos</h3> <ul> <li>No vendemos tu información personal.</li> <li>No compartimos tus datos con terceros para publicidad masiva.</li> </ul> <h3>4. Conservación y seguridad</h3> <p>
Guardamos tus datos durante el tiempo necesario para prestar el servicio. Aplicamos medidas técnicas razonables para proteger la información.
</p> <h3>5. Tus derechos</h3> <p>
Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiendo a
</p> <a href="mailto:admin@constantdigitales.com">admin@constantdititales.com</a> <h3>6. Cambios en esta política</h3> <p>
Podemos actualizar esta política para reflejar mejoras del servicio o cambios legales. La versión vigente será la publicada en esta página.
</p> </section> </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/politica-privacidad.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/politica-privacidad.astro";
const $$url = "/politica-privacidad";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PoliticaPrivacidad,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
