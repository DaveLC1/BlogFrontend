import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");
const adminGate = document.getElementById("adminGate");

let allPosts = [];

// Hidden admin access - double-click logo
if (adminGate) {
  adminGate.addEventListener("dblclick", () => {
    location.href = "admin.html";
  });
  adminGate.style.cursor = "pointer";
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

// Render posts - newest first, image left, title right, preview below, date top, views bottom right
function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.7;">No posts yet</div>';
    return;
  }

  // Sort newest first
  const sorted = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(post => {
    // Get first image from content
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    const firstImg = imgMatch ? imgMatch[1] : null;

    // Text preview (strip HTML, first 100 chars)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content;
    const plainText = tempDiv.textContent || "";
    const previewText = plainText.slice(0, 100) + (plainText.length > 100 ? "..." : "");

    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-preview">
        ${firstImg ? `<img src="${firstImg}" alt="Post preview" class="preview-img">` : ''}
        <div class="preview-text">
          <h3>${post.title.trim()}</h3>
          <p class="preview-content">${previewText}</p>
        </div>
      </div>
      <div class="card-meta">
        <span class="date muted">${new Date(post.created_at).toDateString()}</span>
        <span class="views muted">𓁼 ${views} views</span>
      </div>
    `;

    card.onclick = () => location.href = `/${post.slug}`;

    postsEl.appendChild(card);
  });
}

// Search
searchInput?.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});
