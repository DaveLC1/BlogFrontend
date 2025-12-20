import { API_BASE } from "./config.js";

const postContainer = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

// Get slug from URL
const params = new URLSearchParams(location.search);
const slug = params.get("slug");

// =========================
// Fetch Post
// =========================
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${slug}`);
    if (!res.ok) throw new Error("Failed to load post");
    const post = await res.json();

    postContainer.innerHTML = `
      <h2>${post.title}</h2>
      <p><em>Published: ${new Date(post.created_at).toLocaleString()}</em></p>
      ${post.content}
    `;

    loadComments(post.id);
  } catch (err) {
    postContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// =========================
// Fetch Comments
// =========================
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to load comments");
    const comments = await res.json();

    commentList.innerHTML = "";
    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.name}</strong> <em>${new Date(c.created_at).toLocaleString()}</em>
        <p>${c.content}</p>
      `;
      commentList.appendChild(div);
    });
  } catch (err) {
    commentList.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// =========================
// Add Comment
// =========================
commentForm.onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    post_slug: slug,
    name: nameInput.value.trim(),
    content: contentInput.value.trim()
  };
  if (!payload.name || !payload.content) return alert("All fields required");

  try {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to post comment");

    nameInput.value = "";
    contentInput.value = "";
    loadPost(); // refresh comments
  } catch (err) {
    alert(err.message);
  }
};

// =========================
// Initialize
// =========================
loadPost();
