import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");

let allPosts = [];

// Fetch and render posts
async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");

    allPosts = await res.json();
    renderPosts(allPosts);

    // Remove loading spinner
    const loading = document.querySelector(".loading");
    if (loading) loading.remove();
  } catch (err) {
    postsEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--danger);">
        Failed to load posts. Try again later.
      </div>
    `;
    document.querySelector(".loading")?.remove();
  }
}

function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">
        No posts yet.
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${post.title.trim()}</h3>
      <p class="muted">
        ${new Date(post.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    card.onclick = () => {
      location.href = `post.html?id=${post.id}`;
      // For future slug support: location.href = `/${post.slug}`;
    };

    postsEl.appendChild(card);
  });
}

// Live search
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});

// Hidden admin gate: double tap logo
let tapCount = 0;
document.getElementById("adminGate").addEventListener("click", () => {
  tapCount++;
  setTimeout(() => tapCount = 0, 500);
  if (tapCount >= 2) {
    location.href = "admin.html";
  }
});

// Init
fetchPosts();
