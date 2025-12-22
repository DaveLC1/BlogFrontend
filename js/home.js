import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");
const viewBtn = document.getElementById("viewBtn");

let allPosts = [];

// Floating View button - scroll to posts
viewBtn?.addEventListener("click", () => {
  postsEl.scrollIntoView({ behavior: "smooth" });
});

// Fetch posts
async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error();

    allPosts = await res.json();
    renderPosts(allPosts);

    // Remove loading
    document.querySelector(".loading")?.remove();
  } catch {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--danger);">Failed to load posts</div>';
    document.querySelector(".loading")?.remove();
  }
}

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
      <h3>${post.title.trim()}</h3>
      <p class="muted">
        ${new Date(post.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    // Click for full post
    card.onclick = () => {
      location.href = `post.html?id=${post.id}`;
      // For slugs: location.href = `/${post.slug}`;
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

// Hidden admin (double-tap logo)
let taps = 0;
document.getElementById("adminGate")?.addEventListener("click", () => {
  taps++;
  setTimeout(() => taps = 0, 500);
  if (taps >= 2) location.href = "admin.html";
});

// Init
loadPosts();
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
