import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_DizXBAC_.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_DjbYDvPF.mjs';

const $$Contacto = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contacto - Constant Archivos Digitales", "page": "contacto" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero"> <h2>CONTACTO</h2> <div class="contact-grid"> <article class="contact-card text-block"> <p class="lead">Escribenos o siguenos en redes</p> <p> <strong>Instagram:</strong> <a href="https://www.instagram.com/constantdesigns/" target="_blank" rel="noopener">
@constantdesigns
</a> </p> <p> <strong>Correo:</strong> <a href="mailto:contacto@constantdigitales.com">contacto@constantdigitales.com</a> </p> <p><strong>Horario de respuesta:</strong> Respondemos en un plazo de 48 horas laborables.</p> <p><strong>Privacidad:</strong> Tus datos se usan unicamente para responder a tu consulta.</p> </article> <article class="contact-card"> <form class="contact-form" action="mailto:contacto@constantdigitales.com" method="post" enctype="text/plain"> <label for="name">Nombre</label> <input type="text" id="name" name="name" required> <label for="email">Correo electronico</label> <input type="email" id="email" name="email" required> <label for="message">Mensaje</label> <textarea id="message" name="message" rows="6" required></textarea> <button type="submit" class="btn">Enviar mensaje</button> </form> </article> </div> </section> </main> ` })}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/contacto.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/contacto.astro";
const $$url = "/contacto";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Contacto,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
