import { A as AstroError, I as InvalidComponentArgs, c as createRenderInstruction, d as renderHead, b as addAttribute, a as renderTemplate, e as renderSlot } from './prerender_DjbYDvPF.mjs';
import 'piccolore';
import 'clsx';

function validateArgs(args) {
  if (args.length !== 3) return false;
  if (!args[0] || typeof args[0] !== "object") return false;
  return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
  const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
  const fn = (...args) => {
    if (!validateArgs(args)) {
      throw new AstroError({
        ...InvalidComponentArgs,
        message: InvalidComponentArgs.message(name)
      });
    }
    return cb(...args);
  };
  Object.defineProperty(fn, "name", { value: name, writable: false });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  fn.propagation = propagation;
  return fn;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
  return cb;
}
function createComponent(arg1, moduleId, propagation) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId, propagation);
  } else {
    return createComponentWithOptions(arg1);
  }
}

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Constant Archivos Digitales", page = "inicio" } = Astro2.props;
  const navItems = [
    { id: "inicio", label: "Inicio", href: "/" },
    { id: "productos", label: "Productos", href: "/productos/" },
    { id: "uso", label: "Uso", href: "/uso/" },
    // { id: 'canva', label: 'Canva', href: '/canva/' },
    { id: "gratis", label: "Gratis", href: "/gratis/" },
    { id: "cuenta", label: "Cuenta", href: "/cuenta/" },
    { id: "contacto", label: "Contacto", href: "/contacto/" }
  ];
  const asset = (path) => `/${path}`;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Great+Vibes&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap">${renderHead()}</head> <body${addAttribute(`--ribbon-unsel: url('${asset("static/web/assets/ribbon-unsel.svg")}'); --ribbon-sel: url('${asset("static/web/assets/ribbon-sel.svg")}')`, "style")}> <div class="page-wrap"> <img${addAttribute(asset("static/web/assets/g51.svg"), "src")} alt="" class="decor decor-top-right" aria-hidden="true"> <img${addAttribute(asset("static/web/assets/g45.svg"), "src")} alt="" class="decor decor-leaf-left" aria-hidden="true"> <header class="site-header"> <a href="/" class="home-link"> <div class="brand"> <img${addAttribute(asset("static/web/assets/logo.svg"), "src")} alt="Logo" class="logo"> <div class="site-title"> <img${addAttribute(asset("static/web/assets/g345.png"), "src")} alt="Constant Archivos Digitales"> </div> </div> </a> <button class="hamburger" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle> <span></span><span></span><span></span> </button> </header> <nav class="mobile-nav" aria-label="Navegacion movil" data-mobile-nav> <ul> ${navItems.map((item) => renderTemplate`<li> <a${addAttribute(item.href, "href")}${addAttribute(item.id, "data-nav-id")}${addAttribute(page === item.id ? "active" : "", "class")}${addAttribute(page === item.id ? "page" : void 0, "aria-current")}> ${item.label} </a> </li>`)} <li> <a href="#" data-auth-tab>Iniciar sesion</a> </li> <li data-publish-nav hidden> <a href="/publicar/" data-publish-tab${addAttribute(page === "publicar" ? "active" : "", "class")}${addAttribute(page === "publicar" ? "page" : void 0, "aria-current")}>Publicar</a> </li> </ul> </nav> <aside class="side-nav"> <ul> ${navItems.map((item) => renderTemplate`<li> <a${addAttribute(item.href, "href")}${addAttribute(item.id, "data-nav-id")}${addAttribute(page === item.id ? "active" : "", "class")}${addAttribute(page === item.id ? "page" : void 0, "aria-current")}> ${item.label} </a> </li>`)} <li> <a href="#" data-auth-tab>Iniciar sesion</a> </li> <li data-publish-nav hidden> <a href="/publicar/" data-publish-tab${addAttribute(page === "publicar" ? "active" : "", "class")}${addAttribute(page === "publicar" ? "page" : void 0, "aria-current")}>Publicar</a> </li> </ul> </aside> ${renderSlot($$result, $$slots["default"])} </div> <div class="auth-modal" data-auth-modal hidden> <div class="auth-modal__backdrop" data-auth-close></div> <div class="auth-modal__panel" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"> <button class="auth-modal__close" type="button" aria-label="Cerrar" data-auth-close>×</button> <section data-auth-view="login"> <h3 id="auth-modal-title">Iniciar sesion</h3> <form class="auth-form" data-login-form> <label for="login-identifier">Usuario o email</label> <input id="login-identifier" name="identifier" type="text" required> <label for="login-password">Password</label> <input id="login-password" name="password" type="password" required> <button class="btn" type="submit">Iniciar sesion</button> <button class="auth-link" type="button" data-open-register>
No tienes cuenta de usuario? Registrate aqui
</button> </form> </section> <section data-auth-view="register" hidden> <h3 id="auth-modal-title">Registrarse</h3> <form class="auth-form" data-register-form> <label for="register-username">Username</label> <input id="register-username" name="username" type="text" required minlength="3"> <label for="register-email">Email</label> <input id="register-email" name="email" type="email" required> <label for="register-nombre">Nombre</label> <input id="register-nombre" name="nombre" type="text" required> <label for="register-apellido">Apellido</label> <input id="register-apellido" name="apellido" type="text" required> <label for="register-pais">Pais</label> <input id="register-pais" name="pais" type="text" required> <label for="register-password">Password</label> <input id="register-password" name="password" type="password" required minlength="8"> <label for="register-password-confirm">Confirmar password</label> <input id="register-password-confirm" name="password_confirm" type="password" required minlength="8"> <button class="btn" type="submit">Crear cuenta</button> <button class="auth-link" type="button" data-open-login>
Ya tienes cuenta? Inicia sesion aqui
</button> </form> </section> <p class="auth-message" data-auth-message aria-live="polite"></p> </div> </div> <div class="confirm-modal" data-confirm-modal hidden> <div class="confirm-modal__backdrop" data-confirm-cancel></div> <div class="confirm-modal__panel" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title"> <h3 id="confirm-modal-title">Confirmacion</h3> <p data-confirm-message></p> <div class="confirm-modal__actions"> <button class="btn btn-secondary" type="button" data-confirm-cancel>Cancelar</button> <button class="btn" type="button" data-confirm-accept>Aceptar</button> </div> </div> </div> <footer class="site-footer"> <img${addAttribute(asset("static/web/assets/g40.svg"), "src")} alt="" class="decor decor-bottom-left" aria-hidden="true"> <p>Constant Archivos Digitales © 2026</p> <p class="footer-credit">
Web construida por <a href="https://github.com/nbazaes">nbazaes</a> </p> </footer> ${renderScript($$result, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/nicolas/Desarrollo/webConstAD/webConstAD/frontend/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $, createComponent as c, renderScript as r };
