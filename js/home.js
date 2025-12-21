import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const gate = document.getElementById("adminGate");

let clickCount = 0;
gate.onclick = () => {
  clickCount++;
  if (clickCount === 2) location.href = "admin.html";
  setTimeout(() => clickCount = 0, 400);
};

fetch(`${API_BASE}/api/posts`)
  .then(r => r.json())
  .then(posts => {
    postsEl.innerHTML = "";
    posts.forEach(p => {
      const views = Math.floor(Math.random() * 25 + 1) + "M+";
      const date = new Date(p.created_at).toDateString();

      postsEl.innerHTML += `
        <div class="card" onclick="location.href='post.html?id=${p.id}'">
          <h3>${p.title}</h3>
          <div class="meta">
            <span>${date}</span>
            <span>${views}</span>
          </div>
          <div class="preview">
            ${p.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
          </div>
        </div>
      `;
    });
  });
