const w=document.querySelector("[data-publicar-form]"),$=document.querySelector("[data-publicar-message]"),J=document.querySelector("[data-publicar-loading]"),p=document.querySelector("#pub-categoria"),m=document.querySelector("#pub-coleccion"),D=document.querySelector("[data-categoria-block]"),F=document.querySelector("[data-coleccion-block]"),G=document.querySelector("#pub-es-gratuito"),C=document.querySelector("#pub-precio"),j=document.querySelector("#pub-nombre"),P=document.querySelector("#pub-slug"),q=document.querySelector("[data-publicar-list]"),h=document.querySelector("[data-publicar-items]"),x=document.querySelector("[data-open-create-row]"),K=document.querySelector("[data-open-create-catalogo]"),I=document.querySelector("[data-catalogo-modal]"),Q=document.querySelectorAll("[data-close-catalogo]"),k=document.querySelector("[data-catalogo-form]"),_=document.querySelector("#cat-tipo"),R=document.querySelector("[data-cat-gratuita-wrap]"),y=document.querySelector("[data-global-loading]");let E=[],L=[];const V=`${window.location.protocol}//${window.location.hostname}:8000`,d=e=>`${V}${e}`,r=(e="",t=!1)=>{$&&($.textContent=e,$.classList.toggle("error",t))},b=(e="Procesando...")=>{if(y){const t=y.querySelector("p");t&&(t.textContent=e),y.removeAttribute("hidden")}},f=()=>{y?.setAttribute("hidden","")},X=async()=>{let e=0;for(;e<120;){e+=1;const t=await fetch(d("/api/build/status/"),{credentials:"include"});if(t.ok){const a=await t.json(),o=a?.build?.status;if(o==="ready")return{ok:!0};if(o==="error")return{ok:!1,message:a?.build?.last_error||"Build failed"}}await new Promise(a=>setTimeout(a,1e3))}return{ok:!1,message:"Build timeout"}},Y=()=>I?.removeAttribute("hidden"),H=()=>I?.setAttribute("hidden",""),O=async()=>{const t=await(await fetch(d("/api/auth/session/"),{credentials:"include"})).json();return!t.authenticated||!(t.user?.rol==="admin"||t.user?.is_staff||t.user?.is_superuser)?(window.location.href="/",!1):!0},B=(e,t,a="id",o="nombre")=>{e&&t.forEach(c=>{const n=document.createElement("option");n.value=String(c[a]),n.textContent=c[o],e.appendChild(n)})},W=async()=>{const[e,t]=await Promise.all([fetch(d("/api/catalog/categorias/"),{credentials:"include"}),fetch(d("/api/catalog/colecciones/"),{credentials:"include"})]),a=await e.json(),o=await t.json();E=a.results||[],L=o.results||[],p&&(p.innerHTML='<option value="">Sin categoria</option>'),m&&(m.innerHTML='<option value="">Sin coleccion</option>'),B(p,E.filter(c=>c.es_gratuita)),B(m,L)},v=()=>{const e=G?.value==="true";C&&(C.disabled=e,e&&(C.value="")),D&&(D.hidden=!e),F&&(F.hidden=e),p&&(p.disabled=!e),m&&(m.disabled=e),e?m&&(m.value=""):p&&(p.value="")},S=async()=>{const e=await fetch(d("/api/admin/productos/"),{credentials:"include"});if(!e.ok||!h||!q)return;const a=(await e.json()).results||[];if(!a.length){h.innerHTML="<p>Aun no hay productos publicados.</p>",q.removeAttribute("hidden");return}h.innerHTML=a.map(o=>`
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
        `).join(""),q.removeAttribute("hidden")},Z=e=>{const t=document.createElement("div");t.className="edit-modal",t.innerHTML=`
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
              ${E.filter(i=>i.es_gratuita).map(i=>`<option value="${i.id}" ${e.categoria_id===i.id?"selected":""}>${i.nombre}</option>`).join("")}
            </select>
          </div>

          <div data-edit-coleccion-wrap ${e.es_gratuito?"hidden":""}>
            <label>Coleccion</label>
            <select name="coleccion_id">
              <option value="">Sin coleccion</option>
              ${L.map(i=>`<option value="${i.id}" ${e.coleccion_id===i.id?"selected":""}>${i.nombre}</option>`).join("")}
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
    `,document.body.appendChild(t);const a=()=>t.remove();t.querySelectorAll("[data-close-edit]").forEach(i=>i.addEventListener("click",a));const o=t.querySelector("[data-edit-gratis]"),c=t.querySelector("[data-edit-categoria-wrap]"),n=t.querySelector("[data-edit-coleccion-wrap]"),s=t.querySelector("[data-edit-precio-wrap]"),l=t.querySelector('select[name="categoria_id"]'),u=t.querySelector('select[name="coleccion_id"]'),g=t.querySelector('input[name="precio"]'),M=()=>{const i=o?.value==="true";c&&(c.hidden=!i),n&&(n.hidden=i),s&&(s.hidden=i),l&&(l.disabled=!i),u&&(u.disabled=i),g&&(g.disabled=i),i?(u&&(u.value=""),g&&(g.value="")):l&&(l.value="")};o?.addEventListener("change",M),M();const N=t.querySelector("[data-edit-form]");N?.addEventListener("submit",async i=>{if(i.preventDefault(),!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas guardar cambios en ${e.nombre}?`):Promise.resolve(confirm(`Confirmas guardar cambios en ${e.nombre}?`))))return;const z=new FormData(N);b("Guardando cambios...");const U=await fetch(d(`/api/admin/productos/${e.id}/editar/`),{method:"POST",credentials:"include",body:z});if(f(),!U.ok){r("No se pudo editar el producto.",!0);return}a(),await S(),r("Producto actualizado correctamente.")})};G?.addEventListener("change",v);const ee=e=>e.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-");let A=!1;P?.addEventListener("input",()=>{A=!0});j?.addEventListener("input",()=>{!P||A||(P.value=ee(j.value||""))});w?.addEventListener("submit",async e=>{if(e.preventDefault(),r(""),!await O())return;const a=new FormData(w),o=String(a.get("es_gratuito"))==="true",c=String(a.get("precio")||"").trim(),n=String(a.get("nombre")||"").trim();if(!n){r("Nombre es obligatorio.",!0);return}if(!o&&!c){r("Precio es obligatorio para productos de pago.",!0);return}if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas publicar este producto?

Nombre: ${n}
Tipo: ${o?"Gratis":"Pago"}`):Promise.resolve(confirm(`Confirmas publicar este producto?

Nombre: ${n}
Tipo: ${o?"Gratis":"Pago"}`))))return;a.set("es_gratuito",o?"true":"false"),b("Publicando producto...");const l=await fetch(d("/api/publicar/producto/"),{method:"POST",credentials:"include",body:a}),u=await l.json();if(f(),!l.ok||!u.ok){r(u.message||"No se pudo publicar el producto.",!0);return}w.reset(),A=!1,v(),r(""),await(window.showStyledAlert?window.showStyledAlert(`Publicacion ${u.producto?.nombre||""} exitosa!`,"Publicacion"):Promise.resolve(alert(`Publicacion ${u.producto?.nombre||""} exitosa!`))),window.scrollTo({top:0,behavior:"smooth"}),await S()});const T=()=>{!_||!R||(R.hidden=_.value!=="categoria")};K?.addEventListener("click",Y);Q.forEach(e=>e.addEventListener("click",H));_?.addEventListener("change",T);k?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(k),a=String(t.get("tipo")||""),o=String(t.get("nombre")||"").trim();if(!o){r("Nombre es obligatorio para crear catalogo.",!0);return}if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas crear ${a}: ${o}?`):Promise.resolve(confirm(`Confirmas crear ${a}: ${o}?`))))return;b("Creando categoria...");const n=await fetch(d("/api/admin/catalogo/crear/"),{method:"POST",credentials:"include",body:t}),s=await n.json();if(!n.ok||!s.ok){f(),r(s.message||"No se pudo crear el catalogo.",!0);return}b("Creando categoria...");const l=await X();if(f(),!l.ok){r(`Categoria/Coleccion creada, pero el build fallo: ${l.message}`,!0);return}k.reset(),T(),H(),r(`${s.tipo} creada: ${s.nombre}`),await W(),v()});h?.addEventListener("click",async e=>{const t=e.target.closest("[data-published-item]");if(!t)return;const a=t.getAttribute("data-product-id");if(a){if(e.target.matches("[data-delete-product]")){const o=t.querySelector("h4")?.textContent||"producto";if(!await(window.showStyledConfirm?window.showStyledConfirm(`Confirmas eliminar ${o}?`):Promise.resolve(confirm(`Confirmas eliminar ${o}?`))))return;b("Eliminando producto...");const n=await fetch(d(`/api/admin/productos/${a}/eliminar/`),{method:"POST",credentials:"include"});if(f(),!n.ok){r("No se pudo eliminar el producto.",!0);return}await S(),r("Producto eliminado correctamente.")}if(e.target.matches("[data-edit-product]")){const o=await fetch(d("/api/admin/productos/"),{credentials:"include"});if(!o.ok)return;const n=((await o.json()).results||[]).find(s=>String(s.id)===String(a));if(!n)return;Z(n)}}});const te=async()=>{await O()&&(x&&(x.hidden=!1),await W(),v(),T(),await S(),J?.setAttribute("hidden",""),w?.removeAttribute("hidden"))};te();
