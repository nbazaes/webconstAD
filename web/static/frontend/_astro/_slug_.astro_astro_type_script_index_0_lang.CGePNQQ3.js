const E=document.querySelector("[data-cat-title]"),h=document.querySelector("[data-cat-description]"),d=document.querySelector("[data-cat-products]"),v=document.querySelector("[data-cat-empty]"),F=()=>document.querySelectorAll("[data-admin-product]"),b=document.querySelector("[data-download-modal]"),G=document.querySelectorAll("[data-close-modal], [data-cancel-download]"),U=document.querySelector("[data-confirm-download]"),f=document.querySelector("[data-modal-message]"),y=document.querySelector("[data-newsletter-email]"),B=document.querySelector("[data-newsletter-save]"),n=document.querySelector("[data-newsletter-status]"),_=document.querySelector("[data-guest-subscription]"),p=document.querySelector("[data-global-loading]"),R=`${window.location.protocol}//${window.location.hostname}:8000`,r=e=>`${R}${e}`;let L=!0,g="",k="";const x=(e="Procesando...")=>{if(!p)return;const t=p.querySelector("p");t&&(t.textContent=e),p.removeAttribute("hidden")},P=()=>p?.setAttribute("hidden",""),j=()=>{b&&(b.setAttribute("hidden",""),g="",_?.setAttribute("hidden",""),n&&(n.textContent=""),y&&(y.value=""))};G.forEach(e=>e.addEventListener("click",j));U?.addEventListener("click",async()=>{if(!g){j();return}const e=document.createElement("a");e.href=g,e.rel="noopener",e.target="_blank",document.body.appendChild(e),e.click(),e.remove(),f&&(f.textContent="Producto descargado exitosamente."),L&&_?.removeAttribute("hidden")});const I=()=>{d&&d.querySelectorAll(".free-product-card").forEach(e=>{e.addEventListener("click",()=>{g=e.getAttribute("data-file-url")||"",k=e.getAttribute("data-product-name")||"este archivo",!(!f||!b)&&(f.textContent=`Quieres descargar "${k}"?`,b.removeAttribute("hidden"))})})};B?.addEventListener("click",async()=>{const e=String(y?.value||"").trim();if(!e){n&&(n.textContent="Ingresa un correo valido.",n.classList.add("error"));return}const t=new URLSearchParams;t.append("email",e),await fetch(r("/api/newsletter/suscribir/"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t}),n&&(n.textContent="Correo guardado. Gracias por suscribirte!",n.classList.remove("error"))});const N=async()=>{const e=await fetch(r("/api/auth/session/"),{credentials:"include"});if(!e.ok)return!1;const t=await e.json();return!!(t.authenticated&&(t.user?.rol==="admin"||t.user?.is_staff||t.user?.is_superuser))},W=async e=>{const[t,o]=await Promise.all([fetch(r("/api/catalog/categorias/"),{credentials:"include"}),fetch(r("/api/catalog/colecciones/"),{credentials:"include"})]),s=await t.json(),c=await o.json(),D=(s.results||[]).filter(a=>a.es_gratuita),M=c.results||[],i=document.createElement("div");i.className="edit-modal",i.innerHTML=`
      <div class="edit-modal__backdrop" data-close-edit></div>
      <div class="edit-modal__panel" role="dialog" aria-modal="true">
        <h3>Editar producto</h3>
        <form class="auth-form" data-edit-form>
          <label>Nombre</label><input name="nombre" type="text" value="${e.nombre||""}" required />
          <label>Descripcion</label><textarea name="descripcion" rows="3">${e.descripcion||""}</textarea>
          <label>Imagen preview (opcional)</label><input name="imagen" type="file" accept="image/*" />
          <label>Es gratuito?</label>
          <select name="es_gratuito" data-edit-gratis>
            <option value="true" ${e.es_gratuito?"selected":""}>Si</option>
            <option value="false" ${e.es_gratuito?"":"selected"}>No</option>
          </select>
          <div data-edit-categoria-wrap ${e.es_gratuito?"":"hidden"}>
            <label>Categoria</label>
            <select name="categoria_id">
              <option value="">Sin categoria</option>
              ${D.map(a=>`<option value="${a.id}" ${e.categoria_id===a.id?"selected":""}>${a.nombre}</option>`).join("")}
            </select>
          </div>
          <div data-edit-coleccion-wrap ${e.es_gratuito?"hidden":""}>
            <label>Coleccion</label>
            <select name="coleccion_id">
              <option value="">Sin coleccion</option>
              ${M.map(a=>`<option value="${a.id}" ${e.coleccion_id===a.id?"selected":""}>${a.nombre}</option>`).join("")}
            </select>
          </div>
          <label>Paginas</label><input name="paginas" type="number" min="1" step="1" value="${e.paginas||""}" />
          <div data-edit-precio-wrap ${e.es_gratuito?"hidden":""}>
            <label>Precio</label><input name="precio" type="number" min="0" step="0.01" value="${e.precio||""}" />
          </div>
          <label>Activo?</label>
          <select name="activo"><option value="true" ${e.activo?"selected":""}>Si</option><option value="false" ${e.activo?"":"selected"}>No</option></select>
          <div class="published-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn btn-secondary" type="button" data-close-edit>Cancelar</button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(i),i.querySelectorAll("[data-close-edit]").forEach(a=>a.addEventListener("click",()=>i.remove()));const w=i.querySelector("[data-edit-gratis]"),S=i.querySelector("[data-edit-categoria-wrap]"),$=i.querySelector("[data-edit-coleccion-wrap]"),q=i.querySelector("[data-edit-precio-wrap]"),l=i.querySelector('select[name="categoria_id"]'),u=i.querySelector('select[name="coleccion_id"]'),m=i.querySelector('input[name="precio"]'),A=()=>{const a=w?.value==="true";S&&(S.hidden=!a),$&&($.hidden=a),q&&(q.hidden=a),l&&(l.disabled=!a),u&&(u.disabled=a),m&&(m.disabled=a),a?(u&&(u.value=""),m&&(m.value="")):l&&(l.value="")};w?.addEventListener("change",A),A();const C=i.querySelector("[data-edit-form]");C?.addEventListener("submit",async a=>{if(a.preventDefault(),!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas guardar cambios en ${e.nombre}?`):Promise.resolve(confirm(`Confirmas guardar cambios en ${e.nombre}?`))))return;const O=new FormData(C);x("Guardando cambios...");const T=await fetch(r(`/api/admin/productos/${e.id}/editar/`),{method:"POST",credentials:"include",body:O});P(),T.ok&&window.location.reload()})};N().then(e=>{if(!e){document.querySelectorAll("[data-admin-actions]").forEach(t=>t.setAttribute("hidden",""));return}document.querySelectorAll("[data-admin-actions]").forEach(t=>t.removeAttribute("hidden")),F().forEach(t=>{const o=JSON.parse(t.getAttribute("data-product-json")||"{}");t.querySelector("[data-delete-product]")?.addEventListener("click",async()=>{if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas eliminar ${o.nombre}?`):Promise.resolve(confirm(`Confirmas eliminar ${o.nombre}?`))))return;x("Eliminando producto...");const c=await fetch(r(`/api/admin/productos/${o.id}/eliminar/`),{method:"POST",credentials:"include"});P(),c.ok&&window.location.reload()}),t.querySelector("[data-edit-product]")?.addEventListener("click",()=>W(o))})});fetch(r("/api/auth/session/"),{credentials:"include"}).then(async e=>{if(!e.ok)return;L=!(await e.json()).authenticated});const H=e=>{if(d){if(!e.length){v?.removeAttribute("hidden"),d.setAttribute("hidden","");return}d.innerHTML=e.map(t=>`
          <article class="free-product-wrap" data-admin-product data-product-id="${t.id}" data-product-json='${JSON.stringify(t).replace(/'/g,"&apos;")}'>
            <button type="button" class="free-product-card" data-file-url="${t.archivo||""}" data-product-name="${t.nombre}" title="${t.descripcion||t.nombre}">
              ${t.imagen?`<img src="${t.imagen}" alt="${t.descripcion||t.nombre}" title="${t.descripcion||t.nombre}" />`:`<img src="/static/web/assets/g345.png" alt="${t.descripcion||t.nombre}" />`}
              <span class="product-name" title="${t.descripcion||t.nombre}">${t.nombre}</span>
            </button>
            <div class="published-actions" data-admin-actions hidden>
              <button class="btn" type="button" data-edit-product>Editar</button>
              <button class="btn btn-secondary" type="button" data-delete-product>Eliminar</button>
            </div>
          </article>
        `).join(""),d.removeAttribute("hidden"),I(),N().then(t=>{t&&document.querySelectorAll("[data-admin-actions]").forEach(o=>o.removeAttribute("hidden"))})}},J=async()=>{const e=window.location.pathname.split("/").filter(Boolean),t=e.length?e[e.length-1]:"";if(!t){v?.removeAttribute("hidden");return}const o=await fetch(r(`/api/categorias/${t}/productos/`),{credentials:"include"});if(!o.ok){v?.removeAttribute("hidden");return}const s=await o.json(),c=s.categoria||{};E&&(E.textContent=c.nombre||"Categoria"),c.descripcion&&h&&(h.textContent=c.descripcion,h.removeAttribute("hidden")),H(s.results||[])};J();
