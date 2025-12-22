import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const slug = new URLSearchParams(location.search).get("slug");

if (!slug) {
  postEl.innerHTML = "Post not found";
  throw new Error("Missing slug");
}

/* ================= LOAD POST ================= */

async function loadPost() {
  const res = await fetch(`${API_BASE}/api/posts/slug/${slug}`);
  const post = await res.json();

  postEl.innerHTML = `
    <h1>${post.title}</h1>
    <div class="post-date">${new Date(post.created_at).toDateString()}</div>
    <div class="post-body">${post.content}</div>
  `;
}

/* ================= LOAD COMMENTS ================= */

async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${slug}`);
  const comments = await res.json();

  commentList.innerHTML = "";

  comments.forEach(c => {
    const isAdmin = c.role === "admin";

    commentList.innerHTML += `
      <div class="comment ${isAdmin ? "admin-reply" : ""}">
        <strong>
          ${isAdmin ? "Admin" : c.name}
        </strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: form.name.value,
    content: form.content.value
  };

  await fetch(`${API_BASE}/api/comments/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  form.reset();
  loadComments();
};

loadPost();
loadComments();
    commentList.innerHTML += `
      <div class="comment ${isAdmin ? "admin-reply" : ""}">
        <strong>
          ${isAdmin ? "Admin" : c.name}
        </strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: form.name.value,
    content: form.content.value
  };

  await fetch(`${API_BASE}/api/comments/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  form.reset();
  loadComments();
};

loadPost();
loadComments();
