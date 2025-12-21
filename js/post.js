import { API_BASE } from "./config.js";

/* =========================
   GET SLUG
========================= */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

let postId = null;

/* =========================
   LOAD POST
========================= */
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${slug}`);
    if (!res.ok) throw new Error("Post not found");

    const post = await res.json();
    postId = post.id;

    // Title
    document.getElementById("postTitle").innerText = post.title;

    // Date published
    const date = new Date(post.created_at);
    document.getElementById("postDate").innerText =
      `Published on ${date.toDateString()}`;

    // Content (Quill HTML)
    const content = document.getElementById("postContent");
    content.innerHTML = post.content;

    // Fix images inside content
    fixImages(content);

    // Load comments after post
    loadComments();

  } catch (err) {
    document.body.innerHTML = "<h2>Post not found</h2>";
    console.error(err);
  }
}

/* =========================
   IMAGE FIX (VERY IMPORTANT)
========================= */
function fixImages(container) {
  const images = container.querySelectorAll("img");

  images.forEach(img => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "20px auto";
    img.style.borderRadius = "10px";
  });
}

/* =========================
   LOAD COMMENTS
========================= */
async function loadComments() {
  if (!postId) return;

  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
  const comments = await res.json();

  const list = document.getElementById("commentList");
  list.innerHTML = "";

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
      <strong>${c.name}</strong>
      <p>${c.content}</p>
      <small>${new Date(c.created_at).toLocaleString()}</small>
    `;

    list.appendChild(div);
  });
}

/* =========================
   SUBMIT COMMENT
========================= */
const form = document.getElementById("commentForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!postId) return;

    const name = document.getElementById("commentName").value.trim();
    const content = document.getElementById("commentText").value.trim();

    if (!name || !content) return;

    await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    form.reset();
    loadComments();
  });
}

/* =========================
   INIT
========================= */
loadPost();
