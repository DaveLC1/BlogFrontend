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
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      // Your requested innerHTML - date first (for top-right CSS positioning)
      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Style images in content
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "24px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button - copy current URL
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Post link copied to clipboard! 📋"))
          .catch(() => prompt("Copy this link manually:", location.href));
      });

      // Load comments
      loadComments(post.id);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Back to Home</a>";
    });
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
    console.error(err);
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit comment - actually POST to backend
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Please fill name and comment");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error("Comment failed");

    nameInput.value = "";
    contentInput.value = "";
    loadComments(postId); // Reload to show new comment
    alert("Comment posted successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to post comment");
  }
});        img.style.margin = "20px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button - copy current URL
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied to clipboard! 📋"))
          .catch(() => prompt("Copy this link manually:", location.href));
      });

      // Load comments
      loadComments(post.id);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Home</a>";
    });
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error();

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
    console.error(err);
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit new comment
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Please fill name and comment");
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
    loadComments(postId);
    alert("Comment posted!");
  } catch (err) {
    alert("Failed to post comment");
  }
});
