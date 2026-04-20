const E=window.location.origin,n=e=>`${E}${e}`,k=document.querySelectorAll("[data-admin-product]"),d=document.querySelector("[data-global-loading]"),w=(e="Procesando...")=>{if(!d)return;const a=d.querySelector("p");a&&(a.textContent=e),d.removeAttribute("hidden")},h=()=>{d?.setAttribute("hidden","")},C=async()=>{const e=await fetch(n("/api/auth/session/"),{credentials:"include"});if(!e.ok)return!1;const a=await e.json();return!!(a.authenticated&&(a.user?.rol==="admin"||a.user?.is_staff||a.user?.is_superuser))},A=async e=>{const[a,i]=await Promise.all([fetch(n("/api/catalog/categorias/"),{credentials:"include"}),fetch(n("/api/catalog/colecciones/"),{credentials:"include"})]),u=await a.json(),s=await i.json(),y=(u.results||[]).filter(t=>t.es_gratuita),S=s.results||[],o=document.createElement("div");o.className="edit-modal",o.innerHTML=`
      <div class="edit-modal__backdrop" data-close-edit></div>
      <div class="edit-modal__panel" role="dialog" aria-modal="true">
        <h3>Editar producto</h3>
        <form class="auth-form" data-edit-form>
          <label>Nombre</label><input name="nombre" type="text" value="${e.nombre||""}" required />
          <label>Descripción</label><textarea name="descripcion" rows="3">${e.descripcion||""}</textarea>
          <label>Imagen preview (opcional)</label><input name="imagen" type="file" accept="image/*" />
          <label>¿Es gratuito?</label>
          <select name="es_gratuito" data-edit-gratis>
            <option value="true" ${e.es_gratuito?"selected":""}>Sí</option>
            <option value="false" ${e.es_gratuito?"":"selected"}>No</option>
          </select>
          <div data-edit-categoria-wrap ${e.es_gratuito?"":"hidden"}>
            <label>Categoria</label>
            <select name="categoria_id">
              <option value="">Sin categoria</option>
              ${y.map(t=>`<option value="${t.id}" ${e.categoria_id===t.id?"selected":""}>${t.nombre}</option>`).join("")}
            </select>
          </div>
          <div data-edit-coleccion-wrap ${e.es_gratuito?"hidden":""}>
            <label>Coleccion</label>
            <select name="coleccion_id">
              <option value="">Sin coleccion</option>
              ${S.map(t=>`<option value="${t.id}" ${e.coleccion_id===t.id?"selected":""}>${t.nombre}</option>`).join("")}
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
    `,document.body.appendChild(o);const $=()=>o.remove();o.querySelectorAll("[data-close-edit]").forEach(t=>t.addEventListener("click",$));const m=o.querySelector("[data-edit-gratis]"),p=o.querySelector("[data-edit-categoria-wrap]"),b=o.querySelector("[data-edit-coleccion-wrap]"),f=o.querySelector("[data-edit-precio-wrap]"),c=o.querySelector('select[name="categoria_id"]'),l=o.querySelector('select[name="coleccion_id"]'),r=o.querySelector('input[name="precio"]'),v=()=>{const t=m?.value==="true";p&&(p.hidden=!t),b&&(b.hidden=t),f&&(f.hidden=t),c&&(c.disabled=!t),l&&(l.disabled=t),r&&(r.disabled=t),t?(l&&(l.value=""),r&&(r.value="")):c&&(c.value="")};m?.addEventListener("change",v),v();const g=o.querySelector("[data-edit-form]");g?.addEventListener("submit",async t=>{if(t.preventDefault(),!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas guardar cambios en ${e.nombre}?`):Promise.resolve(confirm(`Confirmas guardar cambios en ${e.nombre}?`))))return;const _=new FormData(g);w("Guardando cambios...");const q=await fetch(n(`/api/admin/productos/${e.id}/editar/`),{method:"POST",credentials:"include",body:_});h(),q.ok&&window.location.reload()})};C().then(e=>{if(!e){document.querySelectorAll("[data-admin-actions]").forEach(a=>a.setAttribute("hidden",""));return}document.querySelectorAll("[data-admin-actions]").forEach(a=>a.removeAttribute("hidden")),k.forEach(a=>{const i=JSON.parse(a.getAttribute("data-product-json")||"{}");a.querySelector("[data-delete-product]")?.addEventListener("click",async()=>{if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas eliminar ${i.nombre}?`):Promise.resolve(confirm(`Confirmas eliminar ${i.nombre}?`))))return;w("Eliminando producto...");const s=await fetch(n(`/api/admin/productos/${i.id}/eliminar/`),{method:"POST",credentials:"include"});h(),s.ok&&window.location.reload()}),a.querySelector("[data-edit-product]")?.addEventListener("click",()=>A(i))})});
