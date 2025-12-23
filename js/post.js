import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

// Get slug from URL
const slug = location.pathname.slice(1).trim().toLowerCase();

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html' class='home'>← Back to Home</a>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error();

      // Date first so CSS can position it top-right
      postContentEl.innerHTML = `
        <p class="muted">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Image styling
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "24px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button - copy clean slug URL
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Post link copied to clipboard! 📋"))
          .catch(() => prompt("Copy this link:", location.href));
      });

      loadComments(post.id);
    })
    .catch(() => {
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Back to Home</a>";
    });
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    const comments = await res.json();

    commentListEl.innerHTML = comments.length === 0 
      ? "<p class='muted'>No comments yet. Be the first!</p>" 
      : "";

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      `;
      commentListEl.appendChild(div);
    });
  } catch {
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

commentForm?.addEventListener("submit", e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();
  if (name && content) {
    alert("Comment submitted!");
    nameInput.value = "";
    contentInput.value = "";
  }
});
