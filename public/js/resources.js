const box=document.getElementById("resources"); if(box){renderResources(box)}
async function renderResources(container){
  try{
    const res=await fetch("./data/sources.json");
    const data=await res.json();
    const groups = Object.entries(data).map(([key, items])=>({title: pretty(key), items}));
    container.innerHTML = groups.map(g=>`
      <div class="resource-group" style="margin-bottom:1rem">
        <h3 style="margin:.25rem 0 .5rem 0">${esc(g.title)}</h3>
        <ul style="margin:0 0 0 1rem">${(g.items||[]).map(it=>`
          <li style="margin:.25rem 0">
            <a href="${esc(it.url||'#')}" target="_blank" rel="noopener">${esc(it.label||'Link')}</a>
            ${it.note?` — <span style="color:#7b5c6a">${esc(it.note)}</span>`:''}
          </li>`).join("")}
        </ul>
      </div>`).join("");
  }catch(e){ console.error(e); container.textContent="Resources failed to load."; }
}
function pretty(key){ return key.replace(/_/g," ").replace(/\w/g, c=>c.toUpperCase()); }
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
