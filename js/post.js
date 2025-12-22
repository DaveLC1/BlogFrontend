import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const list = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const id = new URLSearchParams(location.search).get("id");
if (!id) {
  postEl.innerHTML = "<p>Post not found.</p>";
  throw new Error("Missing post id");
}

/* ================= LOAD POST ================= */

async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${id}`);
    if (!res.ok) throw new Error();

    const post = await res.json();

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content}
    `;
  } catch {
    postEl.innerHTML = "<p>Error loading post.</p>";
  }
}

/* ================= LOAD COMMENTS ================= */

async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${id}`);
  const comments = await res.json();

  list.innerHTML = "";
  comments.forEach(c => {
    list.innerHTML += `
      <div class="comment ${c.role === "admin" ? "admin-reply" : ""}">
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  await fetch(`${API_BASE}/api/comments/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      content: content.value
    })
  });

  form.reset();
  loadComments();
};

loadPost();
loadComments();
