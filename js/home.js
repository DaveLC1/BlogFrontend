import { API_BASE } from "./config.js";
import { views } from "./utils.js";

const el = document.getElementById("posts");

fetch(`${API_BASE}/api/posts`)
  .then(r => r.json())
  .then(ps => {
    el.innerHTML = "";
    ps.forEach(p => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.content.replace(/<[^>]+>/g,"").slice(0,120)}…</p>
        <span class="meta">👁 ${views(p.id)}</span>
      `;
      c.onclick = () => location.href = `post.html?id=${p.id}`;
      el.appendChild(c);
    });
  });
