import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.innerHTML = "<p>Post not found</p>";
  throw new Error("Missing post id");
}

// ================== LOAD POST ==================
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const post = await res.json();

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content}
    `;
  } catch (err) {
    postEl.innerHTML = `<p>Error loading post: ${err.message}</p>`;
  }
}

// ================== LOAD COMMENTS ==================
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
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
  }
}

// ================== ADD COMMENT ==================
form.onsubmit = async e => {
  e.preventDefault();
  const payload = {
    name: nameInput.value.trim(),
    content: contentInput.value.trim()
  };

  if (!payload.name || !payload.content) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to submit comment");

    nameInput.value = "";
    contentInput.value = "";
    await loadComments(); // Refresh comments
  } catch (err) {
    alert(err.message);
  }
};

// ================== INITIAL LOAD ==================
loadPost();
loadComments();
