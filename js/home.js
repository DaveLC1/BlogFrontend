import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");
const viewBtn = document.getElementById("viewBtn");
const adminGate = document.getElementById("adminGate");

let allPosts = [];

// Floating View button
viewBtn?.addEventListener("click", () => {
  postsEl.scrollIntoView({ behavior: "smooth" });
});

// Hidden admin: double-click logo
adminGate?.addEventListener("dblclick", () => {
  location.href = "admin.html";
});

// Fetch posts
fetch(`${API_BASE}/api/posts`)
  .then(res => res.json().catch(() => []))
  .then(data => {
    allPosts = data;
    renderPosts(allPosts);
    document.querySelector(".loading")?.remove();
  })
  .catch(() => {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--danger);">Error loading posts</div>';
    document.querySelector(".loading")?.remove();
  });

function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.7;">No posts yet</div>';
    return;
  }

  posts.forEach(post => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${post.title?.trim() || "Untitled"}</h3>
      <p class="muted">${new Date(post.created_at).toDateString()} 𓁼 ${views} views</p>
    `;
    card.onclick = () => location.href = `post.html?id=${post.id}`;
    postsEl.appendChild(card);
  });
}

// Search
searchInput?.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p => 
    p.title?.toLowerCase().includes(query) || 
    p.content?.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});
