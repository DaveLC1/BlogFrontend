import { API_BASE } from "./config.js";

const postContainer = document.getElementById("post-content");
const commentForm = document.getElementById("commentForm");
const commentList = document.getElementById("commentList");

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

let postId = null;

/* =========================
   Load Post
========================= */
async function loadPost() {
  const res = await fetch(`${API_BASE}/posts/slug/${slug}`);
  const post = await res.json();

  postId = post.id;

  postContainer.innerHTML = `
    <h1>${post.title}</h1>
    <small>${new Date(post.created_at).toDateString()}</small>
    <div class="content">${post.content}</div>
  `;

  loadComments();
}

/* =========================
   Load Comments
========================= */
async function loadComments() {
  const res = await fetch(`${API_BASE}/comments/${postId}`);
  const comments = await res.json();

  commentList.innerHTML = "";

  if (comments.length === 0) {
    commentList.innerHTML = "<p>No comments yet.</p>";
    return;
  }

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
      <strong>${c.name}</strong>
      <small>${new Date(c.created_at).toLocaleString()}</small>
      <p>${c.content}</p>
    `;
    commentList.appendChild(div);
  });
}

/* =========================
   Submit Comment
========================= */
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!name || !content) return;

  await fetch(`${API_BASE}/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, content }),
  });

  commentForm.reset();
  loadComments();
});

/* =========================
   Init
========================= */
loadPost();
