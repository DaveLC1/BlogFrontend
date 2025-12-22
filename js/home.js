import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");
const adminGate = document.getElementById("adminGate");

let allPosts = [];

/* ================= FETCH POSTS ================= */

async function loadPosts() {
  postsEl.innerHTML = `
    <div class="loading">
      <img src="images/loading.gif" alt="loading">
      <p>Please wait...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");

    allPosts = await res.json();
    renderPosts(allPosts);
  } catch (err) {
    postsEl.innerHTML = "Failed to load posts.";
    console.error(err);
  }
}

/* ================= RENDER POSTS ================= */

function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.textContent = "No posts found.";
    return;
  }

  posts.forEach(post => {
    const views = Math.floor(Math.random() * 25_000_000) + 1000;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="images/cover.jpg" alt="cover">
      <div>
        <h3>${post.title}</h3>
        <small class="post-date">
          ${new Date(post.created_at).toDateString()}
        </small>

        <span class="views">
          𓁼 ${views.toLocaleString()}
        </span>
      </div>
    `;

    card.onclick = () => {
      location.href = `post.html?slug=${post.slug}`;
    };

    postsEl.appendChild(card);
  });
}

/* ================= SEARCH ================= */

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(q)
  );

  renderPosts(filtered);
});

/* ================= ADMIN HIDDEN ACCESS ================= */

let clickCount = 0;
adminGate.addEventListener("dblclick", () => {
  location.href = "admin.html";
});

/* ================= INIT ================= */

loadPosts();
