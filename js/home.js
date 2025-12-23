import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");

let allPosts = [];

/* ================= LOAD POSTS ================= */

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();

    allPosts = data;
    renderPosts(data);
  } catch (err) {
    postsEl.innerHTML = "<p style='text-align:center'>Failed to load posts</p>";
  }
}

/* ================= RENDER POSTS ================= */

function renderPosts(posts) {
  postsEl.innerHTML = "";

  if (!posts.length) {
    postsEl.innerHTML = "<p style='text-align:center'>No posts found</p>";
    return;
  }

  posts.forEach(post => {
    postsEl.innerHTML += `
      <article class="post-card" onclick="location.href='post.html?slug=${post.slug}'">
        <h2>${post.title}</h2>
        <p class="date">${new Date(post.created_at).toDateString()}</p>
        <div class="preview">${stripHTML(post.content).slice(0, 120)}...</div>
      </article>
    `;
  });
}

/* ================= SEARCH ================= */

searchInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();

  const filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(q)
  );

  renderPosts(filtered);
});

/* ================= HELPERS ================= */

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/* ================= INIT ================= */

loadPosts();

/* ================= FLOAT BUTTON ================= */

document.getElementById("viewBtn").onclick = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
};
