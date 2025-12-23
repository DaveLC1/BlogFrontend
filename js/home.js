import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");
const adminGate = document.getElementById("adminGate");

let allPosts = [];

// Hidden admin access – double-click the logo (very reliable on desktop & mobile)
if (adminGate) {
  adminGate.addEventListener("dblclick", () => {
    location.href = "admin.html";
  });
  adminGate.style.cursor = "pointer";
  adminGate.title = "Double-click for Admin panel";
}

// Fetch posts
fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data || [];
    renderPosts(allPosts);
    document.querySelector(".loading")?.remove();
  })
  .catch(() => {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--danger);">Failed to load posts</div>';
    document.querySelector(".loading")?.remove();
  });

// Render posts – newest first, compact cards with slug navigation
function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.7;">No posts yet</div>';
    return;
  }

  // Sort newest on top
  const sorted = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(post => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${post.title.trim()}</h3>
      <p class="muted">
        ${new Date(post.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    // Click anywhere on card goes to clean slug URL
    card.onclick = () => {
      location.href = `/${post.slug}`;
    };

    postsEl.appendChild(card);
  });
}

// Search functionality
searchInput?.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});
