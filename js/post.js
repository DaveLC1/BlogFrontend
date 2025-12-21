import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.innerHTML = "Post not found";
  throw new Error("Missing post id");
}

/* ================= LOAD POST ================= */

fetch(`${API_BASE}/api/posts/${postId}`)
  .then(res => res.json())
  .then(post => {
    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content}
    `;
  });

/* ================= LOAD COMMENTS ================= */

fetch(`${API_BASE}/api/comments/${postId}`)
  .then(res => res.json())
  .then(comments => {
    commentList.innerHTML = "";
    comments.forEach(c => {
      commentList.innerHTML += `
        <div class="comment">
          <strong>${c.name}</strong>
          <p>${c.content}</p>
        </div>
      `;
    });
  });

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("name").value,
    content: document.getElementById("content").value
  };

  const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) location.reload();
};    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      content: content.value
    })
  });
  e.target.reset();
  loadComments();
};

loadPost();
loadComments();
