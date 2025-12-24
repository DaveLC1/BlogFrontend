// js/post.js
import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");
const commentDisplay = document.getElementById("comments");

// Get slug from URL path (e.g. /testing-phase → "testing-phase")
const slug = location.pathname.slice(1).trim().toLowerCase();

let postId = null; // Will be set after loading the post

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html' class='home'>← Home</a>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      // Find post by slug (case-insensitive)
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      postId = post.id;

      // Render post content
      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Style images inside the content
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "24px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button functionality
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied to clipboard! 📋"))
          .catch(() => prompt("Copy this link manually:", location.href));
      });

      // Load comments
      loadComments(postId);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Home</a>";
    });
}


function showComment() {
  commentDisplay.classList.toggle("show");
}

  
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to load comments");

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
  } catch (err) {
    console.error("Comments load error:", err);
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit new comment
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Please fill in name and comment");
    return;
  }

  if (!postId) {
    alert("Cannot post comment — post not loaded");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization if your backend requires it
        // Authorization: `Bearer ${token || ""}`
      },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Comment POST failed:", res.status, errorText);
      throw new Error("Failed to post comment");
    }

    // Clear form
    nameInput.value = "";
    contentInput.value = "";

    // Reload comments
    loadComments(postId);

    alert("Comment posted successfully!");
  } catch (err) {
    console.error("Comment submit error:", err);
    alert("Failed to post comment. Please try again.");
  }
});
