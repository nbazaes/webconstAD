import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_CrX8Fc92.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_BB47Iw_p.mjs';

const $$PoliticaPrivacidad = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Politica de privacidad | Constant Archivos Digitales", "page": "politica-privacidad" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>POLITICA DE PRIVACIDAD</h2> <p class="lead">
En Constant Archivos Digitales cuidamos tu informacion personal y la usamos solo para operar el sitio de forma segura.
</p> <h3>1. Que datos recopilamos</h3> <ul> <li>Datos de cuenta: nombre de usuario, email, nombre, apellido y pais.</li> <li>Datos tecnicos basicos: informacion de sesion y seguridad para mantener tu cuenta protegida.</li> <li>Si te suscribes al boletin: tu email.</li> </ul> <h3>2. Para que usamos tus datos</h3> <ul> <li>Crear y administrar tu cuenta.</li> <li>Permitir inicio de sesion y acceso a descargas.</li> <li>Mejorar el funcionamiento y la seguridad del sitio.</li> <li>Enviar novedades solo si te suscribes voluntariamente.</li> </ul> <h3>3. Que no hacemos con tus datos</h3> <ul> <li>No vendemos tu informacion personal.</li> <li>No compartimos tus datos con terceros para publicidad masiva.</li> </ul> <h3>4. Conservacion y seguridad</h3> <p>
Guardamos tus datos durante el tiempo necesario para prestar el servicio. Aplicamos medidas tecnicas razonables para proteger la informacion.
</p> <h3>5. Tus derechos</h3> <p>
Puedes solicitar acceso, correccion o eliminacion de tus datos personales escribiendo por los canales de contacto publicados en el sitio.
</p> <h3>6. Cambios en esta politica</h3> <p>
Podemos actualizar esta politica para reflejar mejoras del servicio o cambios legales. La version vigente sera la publicada en esta pagina.
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
