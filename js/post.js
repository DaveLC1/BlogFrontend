import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const token = localStorage.getItem("token");
const isAdmin = !!token;

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.textContent = "Post not found";
  throw new Error("Missing post ID");
}

/* ================= LOAD POST ================= */

async function loadPost() {
  const res = await fetch(`${API_BASE}/api/posts/${postId}`);
  const post = await res.json();

  postEl.innerHTML = `
    <h1>${post.title}</h1>
    <div class="post-date">
      ${new Date(post.created_at).toDateString()}
    </div>
    ${post.content}
  `;
}

/* ================= LOAD COMMENTS ================= */

async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${postId}`);
  const comments = await res.json();

  commentList.innerHTML = "";

  comments.forEach(c => {
    const wrapper = document.createElement("div");
    wrapper.className = "comment";

    wrapper.innerHTML = `
      <strong>${c.name}</strong>
      <p>${c.content}</p>
    `;

    // ADMIN REPLY UI (frontend only)
    if (isAdmin) {
      const replyBox = document
        .getElementById("adminReplyTemplate")
        .content.cloneNode(true);

      const textarea = replyBox.querySelector("textarea");
      const btn = replyBox.querySelector("button");

      btn.onclick = async () => {
        if (!textarea.value.trim()) return;

        const replyHTML = `
          ${c.content}
          <div class="admin-reply">
            <span class="admin-badge">Admin</span>
            <p>${textarea.value}</p>
          </div>
        `;

        await fetch(`${API_BASE}/api/comments/${postId}/${c.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content: replyHTML })
        });

        loadComments();
      };

      wrapper.appendChild(replyBox);
    }

    commentList.appendChild(wrapper);
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: name.value,
    content: content.value
  };

  await fetch(`${API_BASE}/api/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  e.target.reset();
  loadComments();
};

/* ================= INIT ================= */

loadPost();
loadComments();
