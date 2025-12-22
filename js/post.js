import { API_BASE } from "./config.js";

const postContent = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const urlParams = new URLSearchParams(location.search);
const postId = urlParams.get("id");

if (!postId) {
  postContent.innerHTML = "<h2>Invalid post link</h2>";
}

// Load post
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    if (!res.ok) throw new Error("Post not found");

    const post = await res.json();

    postContent.innerHTML = `
      <h1>${post.title.trim()}</h1>
      <p class="muted">${new Date(post.created_at).toDateString()}</p>
      <div class="post-body">${post.content}</div>
    `;

    // Style images in content
    postContent.querySelectorAll("img").forEach(img => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.margin = "20px auto";
      img.style.borderRadius = "10px";
    });
  } catch (err) {
    postContent.innerHTML = "<h2>Post not found or error loading</h2>";
  }
}

// Load comments
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error();

    const comments = await res.json();
    commentList.innerHTML = comments.length === 0
      ? "<p class='muted'>No comments yet. Be the first!</p>"
      : "";

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      `;
      commentList.appendChild(div);
    });
  } catch (err) {
    commentList.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit comment
commentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Name and comment are required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error();

    nameInput.value = "";
    contentInput.value = "";
    loadComments();
  } catch (err) {
    alert("Failed to post comment");
  }
});

// Start
loadPost();
loadComments();
