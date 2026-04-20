import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_DHpzAE-s.mjs';
import 'piccolore';
import { m as maybeRenderHead, s as spreadAttributes, b as addAttribute, a as renderTemplate, r as renderComponent, F as Fragment, u as unescapeHTML } from './prerender_7Y9ZwfO2.mjs';
import { getIconData, iconToSVG } from '@iconify/utils';

const icons = {};

const cache = /* @__PURE__ */ new WeakMap();

const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Icon;
  class AstroIconError extends Error {
    constructor(message) {
      super(message);
      this.hint = "";
    }
  }
  const req = Astro2.request;
  const { name = "", title, desc, "is:inline": inline = false, ...props } = Astro2.props;
  const map = cache.get(req) ?? /* @__PURE__ */ new Map();
  const i = map.get(name) ?? 0;
  map.set(name, i + 1);
  cache.set(req, map);
  const includeSymbol = !inline && i === 0;
  let [setName, iconName] = name.split(":");
  if (!setName && iconName) {
    const err = new AstroIconError(`Invalid "name" provided!`);
    throw err;
  }
  if (!iconName) {
    iconName = setName;
    setName = "local";
    if (!icons[setName]) {
      const err = new AstroIconError('Unable to load the "local" icon set!');
      throw err;
    }
    if (!(iconName in icons[setName].icons)) {
      const err = new AstroIconError(`Unable to locate "${name}" icon!`);
      throw err;
    }
  }
  const collection = icons[setName];
  if (!collection) {
    const err = new AstroIconError(`Unable to locate the "${setName}" icon set!`);
    throw err;
  }
  const iconData = getIconData(collection, iconName ?? setName);
  if (!iconData) {
    const err = new AstroIconError(`Unable to locate "${name}" icon!`);
    throw err;
  }
  const id = `ai:${collection.prefix}:${iconName ?? setName}`;
  if (props.size) {
    props.width = props.size;
    props.height = props.size;
    delete props.size;
  }
  const renderData = iconToSVG(iconData);
  const normalizedProps = { ...renderData.attributes, ...props };
  const normalizedBody = renderData.body;
  const { viewBox } = normalizedProps;
  if (includeSymbol) {
    delete normalizedProps.viewBox;
  }
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(normalizedProps)}${addAttribute(name, "data-icon")}> ${title && renderTemplate`<title>${title}</title>`} ${desc && renderTemplate`<desc>${desc}</desc>`} ${inline ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "id": id }, { "default": ($$result2) => renderTemplate`${unescapeHTML(normalizedBody)}` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${includeSymbol && renderTemplate`<symbol${addAttribute(id, "id")}${addAttribute(viewBox, "viewBox")}>${unescapeHTML(normalizedBody)}</symbol>`}<use${addAttribute(`#${id}`, "href")}></use> ` })}`} </svg>`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/node_modules/astro-icon/components/Icon.astro", void 0);

const $$Contacto = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Contacto - Constant Archivos Digitales", "page": "contacto" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero"> <h2>CONTACTO</h2> <div class="contact-grid"> <article class="contact-card text-block"> <p class="lead">Escríbenos o síguenos en redes</p> <p> <strong>Instagram:</strong> <a href="https://instagram.com/tu_usuario" class="social-link"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:instagram", "class": "w-6 h-6 hover:text-pink-500" })} <span>Sígueme en Instagram</span> </a> </p> <p> <strong>Correo:</strong> <a href="mailto:contacto@constantdigitales.com">contacto@constantdigitales.com</a> </p> <p><strong>Horario de respuesta:</strong> Respondemos en un plazo de 48 horas laborables.</p> <p><strong>Privacidad:</strong> Tus datos se usan unicamente para responder a tu consulta.</p> </article> <article class="contact-card"> <form class="contact-form" action="mailto:contacto@constantdigitales.com" method="post" enctype="text/plain"> <label for="name">Nombre</label> <input type="text" id="name" name="name" required> <label for="email">Correo electronico</label> <input type="email" id="email" name="email" required> <label for="message">Mensaje</label> <textarea id="message" name="message" rows="6" required></textarea> <button type="submit" class="btn">Enviar mensaje</button> </form> </article> </div> </section> </main> ` })}`;
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
