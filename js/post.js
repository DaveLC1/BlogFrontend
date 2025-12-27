import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const toggleBtn = document.getElementById("toggleComments");
const commentsContainer = document.getElementById("commentsContainer");

// Get slug from URL
const slug = location.pathname.slice(1).trim().toLowerCase();

let postId = null;

// -----------------------
// Utilities
// -----------------------
function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

// -----------------------
// Toggle comments
// -----------------------
toggleBtn?.addEventListener("click", () => {
  commentsContainer.classList.toggle("hidden");
  toggleBtn.textContent = commentsContainer.classList.contains("hidden")
    ? "Show Comments ·͟͟͟͞͞➳"
    : "Hide Comments ⤴";
});

// -----------------------
// Load post
// -----------------------
if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      postId = post.id;

      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${escapeHTML(post.title)}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied!"))
          .catch(() => prompt("Copy manually:", location.href));
      });

      loadComments(postId);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2>";
    });
}

// -----------------------
// Load comments
// -----------------------
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed");

    const comments = await res.json();
    commentListEl.innerHTML = "";

    if (comments.length === 0) {
      commentListEl.innerHTML = "<p class='muted'>No comments yet.</p>";
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";

      div.innerHTML = `
        <div class="comment-header">
          <strong>${escapeHTML(c.name)}</strong>
          <span class="comment-time">${formatDate(c.created_at)}</span>
        </div>
        <p>${escapeHTML(c.content)}</p>
      `;

      commentListEl.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    commentListEl.innerHTML =
      "<p class='muted'>Failed to load comments</p>";
  }
}

// -----------------------
// Submit comment (optimistic)
// -----------------------
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Fill name and comment");
    return;
  }

  if (!postId) {
    alert("Post not loaded");
    return;
  }

  // Optimistic UI
  const tempDiv = document.createElement("div");
  tempDiv.className = "comment optimistic";
  tempDiv.innerHTML = `
    <div class="comment-header">
      <strong>${escapeHTML(name)}</strong>
      <span class="comment-time">Posting…</span>
    </div>
    <p>${escapeHTML(content)}</p>
  `;
  commentListEl.prepend(tempDiv);

  nameInput.value = "";
  contentInput.value = "";

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error("Failed");

    tempDiv.remove();
    loadComments(postId);
  } catch (err) {
    console.error(err);
    tempDiv.remove();
    alert("Failed to post comment");
  }
});
