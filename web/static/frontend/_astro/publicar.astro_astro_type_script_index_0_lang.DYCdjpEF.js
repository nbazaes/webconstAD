const f=document.querySelector("[data-publicar-form]"),v=document.querySelector("[data-publicar-message]"),I=document.querySelector("[data-publicar-loading]"),u=document.querySelector("#pub-categoria"),p=document.querySelector("#pub-coleccion"),N=document.querySelector("[data-categoria-block]"),T=document.querySelector("[data-coleccion-block]"),j=document.querySelector("#pub-es-gratuito"),y=document.querySelector("#pub-precio"),M=document.querySelector("#pub-nombre"),$=document.querySelector("#pub-slug"),S=document.querySelector("[data-publicar-list]"),g=document.querySelector("[data-publicar-items]"),w=document.querySelector("[data-global-loading]");let q=[],P=[];const H=window.location.origin,l=e=>`${H}${e}`,s=(e="",t=!1)=>{v&&(v.textContent=e,v.classList.toggle("error",t))},_=(e="Procesando...")=>{if(w){const t=w.querySelector("p");t&&(t.textContent=e),w.removeAttribute("hidden")}},C=()=>{w?.setAttribute("hidden","")},x=async()=>{const t=await(await fetch(l("/api/auth/session/"),{credentials:"include"})).json();return!t.authenticated||!(t.user?.rol==="admin"||t.user?.is_staff||t.user?.is_superuser)?(window.location.href="/",!1):!0},D=(e,t,i="id",o="nombre")=>{e&&t.forEach(r=>{const n=document.createElement("option");n.value=String(r[i]),n.textContent=r[o],e.appendChild(n)})},O=async()=>{const[e,t]=await Promise.all([fetch(l("/api/catalog/categorias/"),{credentials:"include"}),fetch(l("/api/catalog/colecciones/"),{credentials:"include"})]),i=await e.json(),o=await t.json();q=i.results||[],P=o.results||[],u&&(u.innerHTML='<option value="">Sin categoría</option>'),p&&(p.innerHTML='<option value="">Sin colección</option>'),D(u,q.filter(r=>r.es_gratuita)),D(p,P)},L=()=>{const e=j?.value==="true";y&&(y.disabled=e,e&&(y.value="")),N&&(N.hidden=!e),T&&(T.hidden=e),u&&(u.disabled=!e),p&&(p.disabled=e),e?p&&(p.value=""):u&&(u.value="")},h=async()=>{const e=await fetch(l("/api/admin/productos/"),{credentials:"include"});if(!e.ok||!g||!S)return;const i=(await e.json()).results||[];if(!i.length){g.innerHTML="<p>Aun no hay productos publicados.</p>",S.removeAttribute("hidden");return}g.innerHTML=i.map(o=>`
          <article class="published-item" data-published-item data-product-id="${o.id}">
            <div>
              <h4>${o.nombre}</h4>
              <p>${o.es_gratuito?"Gratis":"Pago"} · ${o.es_gratuito?o.categoria_nombre||"Sin categoria":o.coleccion_nombre||"Sin coleccion"}</p>
            </div>
            <div class="published-actions">
              <button class="btn" type="button" data-edit-product>Editar</button>
              <button class="btn btn-secondary" type="button" data-delete-product>Eliminar</button>
            </div>
          </article>
        `).join(""),S.removeAttribute("hidden")},R=e=>{const t=document.createElement("div");t.className="edit-modal",t.innerHTML=`
      <div class="edit-modal__backdrop" data-close-edit></div>
      <div class="edit-modal__panel" role="dialog" aria-modal="true">
        <h3>Editar producto</h3>
        <form class="auth-form" data-edit-form>
          <label>Nombre</label>
          <input name="nombre" type="text" value="${e.nombre||""}" required />

          <label>Descripcion</label>
          <textarea name="descripcion" rows="3">${e.descripcion||""}</textarea>

          <label>Imagen preview (opcional)</label>
          <input name="imagen" type="file" accept="image/*" />

          <label>Es gratuito?</label>
          <select name="es_gratuito" data-edit-gratis>
            <option value="true" ${e.es_gratuito?"selected":""}>Si</option>
            <option value="false" ${e.es_gratuito?"":"selected"}>No</option>
          </select>

          <div data-edit-categoria-wrap ${e.es_gratuito?"":"hidden"}>
            <label>Categoria</label>
            <select name="categoria_id">
              <option value="">Sin categoria</option>
              ${q.filter(a=>a.es_gratuita).map(a=>`<option value="${a.id}" ${e.categoria_id===a.id?"selected":""}>${a.nombre}</option>`).join("")}
            </select>
          </div>

          <div data-edit-coleccion-wrap ${e.es_gratuito?"hidden":""}>
            <label>Coleccion</label>
            <select name="coleccion_id">
              <option value="">Sin coleccion</option>
              ${P.map(a=>`<option value="${a.id}" ${e.coleccion_id===a.id?"selected":""}>${a.nombre}</option>`).join("")}
            </select>
          </div>

          <label>Paginas</label>
          <input name="paginas" type="number" min="1" step="1" value="${e.paginas||""}" />

          <div data-edit-precio-wrap ${e.es_gratuito?"hidden":""}>
            <label>Precio</label>
            <input name="precio" type="number" min="0" step="0.01" value="${e.precio||""}" />
          </div>

          <label>Activo?</label>
          <select name="activo">
            <option value="true" ${e.activo?"selected":""}>Si</option>
            <option value="false" ${e.activo?"":"selected"}>No</option>
          </select>

          <div class="published-actions">
            <button class="btn" type="submit">Guardar</button>
            <button class="btn btn-secondary" type="button" data-close-edit>Cancelar</button>
          </div>
        </form>
      </div>
    `,document.body.appendChild(t);const i=()=>t.remove();t.querySelectorAll("[data-close-edit]").forEach(a=>a.addEventListener("click",i));const o=t.querySelector("[data-edit-gratis]"),r=t.querySelector("[data-edit-categoria-wrap]"),n=t.querySelector("[data-edit-coleccion-wrap]"),m=t.querySelector("[data-edit-precio-wrap]"),d=t.querySelector('select[name="categoria_id"]'),c=t.querySelector('select[name="coleccion_id"]'),b=t.querySelector('input[name="precio"]'),A=()=>{const a=o?.value==="true";r&&(r.hidden=!a),n&&(n.hidden=a),m&&(m.hidden=a),d&&(d.disabled=!a),c&&(c.disabled=a),b&&(b.disabled=a),a?(c&&(c.value=""),b&&(b.value="")):d&&(d.value="")};o?.addEventListener("change",A),A();const E=t.querySelector("[data-edit-form]");E?.addEventListener("submit",async a=>{if(a.preventDefault(),!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas guardar cambios en ${e.nombre}?`):Promise.resolve(confirm(`Confirmas guardar cambios en ${e.nombre}?`))))return;const F=new FormData(E);_("Guardando cambios...");const G=await fetch(l(`/api/admin/productos/${e.id}/editar/`),{method:"POST",credentials:"include",body:F});if(C(),!G.ok){s("No se pudo editar el producto.",!0);return}i(),await h(),s("Producto actualizado correctamente.")})};j?.addEventListener("change",L);const z=e=>e.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-");let k=!1;$?.addEventListener("input",()=>{k=!0});M?.addEventListener("input",()=>{!$||k||($.value=z(M.value||""))});f?.addEventListener("submit",async e=>{if(e.preventDefault(),s(""),!await x())return;const i=new FormData(f),o=String(i.get("es_gratuito"))==="true",r=String(i.get("precio")||"").trim(),n=String(i.get("nombre")||"").trim();if(!n){s("Nombre es obligatorio.",!0);return}if(!o&&!r){s("Precio es obligatorio para productos de pago.",!0);return}if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas publicar este producto?

Nombre: ${n}
Tipo: ${o?"Gratis":"Pago"}`):Promise.resolve(confirm(`Confirmas publicar este producto?

Nombre: ${n}
Tipo: ${o?"Gratis":"Pago"}`))))return;i.set("es_gratuito",o?"true":"false"),_("Publicando producto...");const d=await fetch(l("/api/publicar/producto/"),{method:"POST",credentials:"include",body:i}),c=await d.json();if(C(),!d.ok||!c.ok){s(c.message||"No se pudo publicar el producto.",!0);return}f.reset(),k=!1,L(),s(""),await(window.showStyledAlert?window.showStyledAlert(`Publicacion ${c.producto?.nombre||""} exitosa!`,"Publicacion"):Promise.resolve(alert(`Publicacion ${c.producto?.nombre||""} exitosa!`))),window.scrollTo({top:0,behavior:"smooth"}),await h()});g?.addEventListener("click",async e=>{const t=e.target.closest("[data-published-item]");if(!t)return;const i=t.getAttribute("data-product-id");if(i){if(e.target.matches("[data-delete-product]")){const o=t.querySelector("h4")?.textContent||"producto";if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas eliminar ${o}?`):Promise.resolve(confirm(`Confirmas eliminar ${o}?`))))return;_("Eliminando producto...");const n=await fetch(l(`/api/admin/productos/${i}/eliminar/`),{method:"POST",credentials:"include"});if(C(),!n.ok){s("No se pudo eliminar el producto.",!0);return}await h(),s("Producto eliminado correctamente.")}if(e.target.matches("[data-edit-product]")){const o=await fetch(l("/api/admin/productos/"),{credentials:"include"});if(!o.ok)return;const n=((await o.json()).results||[]).find(m=>String(m.id)===String(i));if(!n)return;R(n)}}});const W=async()=>{await x()&&(await O(),L(),await h(),I?.setAttribute("hidden",""),f?.removeAttribute("hidden"))};W();
