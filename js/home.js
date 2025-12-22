import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const search = document.getElementById("search");

let allPosts = [];

async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();
  allPosts = posts;
  render(posts);
}

function render(posts) {
  postsEl.innerHTML = "";

  posts.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${p.title}</h3>
      <div class="meta">
        <span>${new Date(p.created_at).toDateString()}</span>
        <span class="views">👁 12k</span>
      </div>
    `;

    card.onclick = () => {
      location.href = `post.html?slug=${p.slug}`;
    };

    postsEl.appendChild(card);
  });
}

search.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  render(allPosts.filter(p => p.title.toLowerCase().includes(q)));
});

loadPosts();    postsEl.textContent = "No posts found.";
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
