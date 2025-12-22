import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");

let allPosts = [];

// Fetch posts
fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data || [];
    renderPosts(allPosts);
  });

// Proper rendering with styled cards
function renderPosts(posts) {
  postsEl.innerHTML = "";  // Clear everything, no raw text

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.7;">No posts yet</div>';
    return;
  }

  posts.forEach(post => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";  // This applies your dark card styling + hover

    card.innerHTML = `
      <h3>${post.title.trim()}</h3>
      <p class="muted">
        ${new Date(post.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    // Make card clickable to show full content
    card.onclick = () => {
      location.href = `post.html?id=${post.id}`;
    };

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

// Double-tap logo for admin
let taps = 0;
document.getElementById("adminGate")?.addEventListener("click", () => {
  taps++;
  setTimeout(() => taps = 0, 500);
  if (taps >= 2) location.href = "admin.html";
});
