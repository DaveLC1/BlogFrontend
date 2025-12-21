import { API_BASE } from "./config.js";

const postsBox = document.getElementById("posts");
const search = document.getElementById("search");

// hidden admin entry
let clicks = 0;
document.getElementById("adminGate").ondblclick = () => {
  location.href = "admin.html";
};

function fakeViews() {
  const list = ["1.2k", "8.4k", "25M+", "900", "14k"];
  return list[Math.floor(Math.random() * list.length)];
}

async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();

  postsBox.innerHTML = "";

  posts.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${p.title}</h3>
        <small class="muted">${new Date(p.created_at).toDateString()}</small>
        <span class="views">${fakeViews()}</span>
      </div>
    `;
    card.onclick = () => {
      location.href = `post.html?id=${p.id}`;
    };
    postsBox.appendChild(card);
  });
}

search.oninput = e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? "" : "none";
  });
};

loadPosts();
