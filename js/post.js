import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.innerHTML = "Post not found";
}

// Load post safely
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const post = await res.json();
    if (!post) throw new Error("No post data");

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content || "<p>No content</p>"}
    `;
  } catch (err) {
    postEl.innerHTML = `<p>Error loading post: ${err.message}</p>`;
    console.error(err);
  }
}

// Load comments
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
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
  } catch (err) {
    commentList.innerHTML = `<p>Error loading comments: ${err.message}</p>`;
    console.error(err);
  }
}

// Add comment
form.onsubmit = async e => {
  e.preventDefault();
  const payload = {
    name: document.getElementById("name").value,
    content: document.getElementById("content").value
  };

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to post comment");
    form.reset();
    loadComments();
  } catch (err) {
    alert(err.message);
  }
};

loadPost();
loadComments();
