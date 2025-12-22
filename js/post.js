import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const slug = new URLSearchParams(location.search).get("slug");

if (!slug) {
  postEl.innerHTML = "Post not found";
  throw new Error("Missing slug");
}

/* LOAD POST */
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/slug/${slug}`);
    const post = await res.json();

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <small>${new Date(post.created_at).toDateString()}</small>
      <div>${post.content}</div>
    `;
  } catch {
    postEl.innerHTML = "Error loading post";
  }
}

/* LOAD COMMENTS */
async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${slug}`);
  const comments = await res.json();

  commentList.innerHTML = "";

  comments.forEach(c => {
    const admin = c.role === "admin";
    commentList.innerHTML += `
      <div class="comment ${admin ? "admin" : ""}">
        <b>${admin ? "Admin" : c.name}</b>
        <p>${c.content}</p>
      </div>
    `;
  });
}

/* ADD COMMENT */
form.onsubmit = async e => {
  e.preventDefault();

  await fetch(`${API_BASE}/api/comments/${slug}`, {
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
