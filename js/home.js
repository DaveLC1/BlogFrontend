import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");

let allPosts = [];

fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data || [];
    renderPosts(allPosts);
  })
  .finally(() => {
    document.querySelector(".loading")?.remove();  // Force remove spinner
  });

function renderPosts(posts) {
  postsEl.innerHTML = "";

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${post.title.trim()}</h3>`;
    card.onclick = () => location.href = `/${post.slug}`;
    postsEl.appendChild(card);
  });
}
