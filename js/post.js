import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(location.search);
const slug = params.get("slug");

if (!slug) {
  postEl.textContent = "Post not found";
  throw new Error("Missing slug");
}

/* ===== LOAD POST ===== */
(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${slug}`);

    if (!res.ok) throw new Error("Post fetch failed");

    const post = await res.json();

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">
        ${new Date(post.created_at).toDateString()}
      </div>
      ${post.content}
    `;
  } catch (err) {
    postEl.textContent = "Error loading post";
    console.error(err);
  }
})();

/* ===== LOAD COMMENTS ===== */
async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${slug}`);
  const comments = await res.json();

  commentList.innerHTML = "";
  comments.forEach(c => {
    commentList.innerHTML += `
      <div class="comment">
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

loadComments();

/* ===== ADD COMMENT ===== */
form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: name.value,
    content: content.value
  };

  const res = await fetch(`${API_BASE}/api/comments/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    form.reset();
    loadComments();
  }
};
