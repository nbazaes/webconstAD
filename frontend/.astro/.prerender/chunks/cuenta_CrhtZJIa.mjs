import { c as createComponent, $ as $$BaseLayout, r as renderScript } from './BaseLayout_CSLk66v2.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_D7rbcRYH.mjs';

const $$Cuenta = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cuenta | Constant Archivos Digitales", "page": "cuenta" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="content"> <section class="products-hero text-block"> <h2>CUENTA</h2> <p class="lead">Revisa y actualiza tus datos personales.</p> </section> <section class="products-hero text-block account-page-card" data-account-page> <p>Cargando información de tu cuenta...</p> </section> <section class="products-hero text-block account-page-card" data-login-page hidden> <h3>Iniciar sesión</h3> <form class="auth-form" data-page-login-form> <label for="page-login-identifier">Usuario o email</label> <input id="page-login-identifier" name="identifier" type="text" required> <label for="page-login-password">Password</label> <input id="page-login-password" name="password" type="password" required> <button class="btn" type="submit">Iniciar sesión</button> </form> </section> </main> ` })} ${renderScript($$result, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/cuenta.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/cuenta.astro", void 0);

const $$file = "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/pages/cuenta.astro";
const $$url = "/cuenta";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cuenta,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
