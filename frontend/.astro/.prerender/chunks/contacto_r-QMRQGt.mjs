import { c as createComponent, $ as $$BaseLayout, a as $$Icon } from './BaseLayout_CrX8Fc92.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_BB47Iw_p.mjs';

const $$Contacto = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contacto | Constant Archivos Digitales", "page": "contacto" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero"> <h2>CONTACTO</h2> <div class="contact-grid"> <article class="contact-card text-block"> <p class="lead">Escríbenos o síguenos en redes</p> <p> <strong>Instagram:</strong> <a href="https://instagram.com/tu_usuario" class="social-link"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:instagram", "class": "w-6 h-6 hover:text-pink-500" })} <span>Sígueme en Instagram</span> </a> </p> <p> <strong>Correo:</strong> <a href="mailto:contacto@constantdigitales.com">contacto@constantdigitales.com</a> </p> <p><strong>Horario de respuesta:</strong> Respondemos en un plazo de 48 horas laborables.</p> <p><strong>Privacidad:</strong> Tus datos se usan únicamente para responder a tu consulta.</p> </article> <article class="contact-card"> <form class="contact-form" action="mailto:contacto@constantdigitales.com" method="post" enctype="text/plain"> <label for="name">Nombre</label> <input type="text" id="name" name="name" required> <label for="email">Correo electrónico</label> <input type="email" id="email" name="email" required> <label for="message">Mensaje</label> <textarea id="message" name="message" rows="6" required></textarea> <button type="submit" class="btn">Enviar mensaje</button> </form> </article> </div> </section> </main> ` })}`;
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
