import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const loading = document.getElementById("loading");
const search = document.getElementById("search");

let posts = [];

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    posts = await res.json();
    render(posts);
  } catch (e) {
    postsEl.innerHTML = "Failed to load posts";
  }
}

function render(list) {
  postsEl.innerHTML = "";

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.title}</h3>
      <small>${new Date(p.created_at).toDateString()}</small>
      <span class="views">25M+</span>
    `;

    div.onclick = () => {
      location.href = `post.html?slug=${p.slug}`;
    };

    postsEl.appendChild(div);
  });
}

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(posts.filter(p => p.title.toLowerCase().includes(q)));
};

loadPosts();
