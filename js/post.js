import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html'>← Home</a>";
  return;
}

async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    if (!res.ok) throw new Error();
    const post = await res.json();

    postContentEl.innerHTML = `
      <h1>${post.title?.trim() || "Untitled"}</h1>
      <p class="muted">${new Date(post.created_at).toDateString()}</p>
      <div class="post-body">${post.content || ""}</div>
    `;

    postContentEl.querySelectorAll("img").forEach(img => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.margin = "20px auto";
      img.style.borderRadius = "10px";
    });
  } catch {
    postContentEl.innerHTML = "<h2>Post not found</h2>";
  }
}

async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error();
    const comments = await res.json();

    commentListEl.innerHTML = comments.length ? "" : "<p class='muted'>No comments yet</p>";

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.name}</strong><p>${c.content}</p>`;
      commentListEl.appendChild(div);
    });
  } catch {
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

commentForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();
  if (!name || !content) return alert("Fill name and comment");

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
  } catch {
    alert("Failed to post comment");
  }
});

loadPost();
loadComments();    });
  } catch {
    postContentEl.innerHTML = "<h2>Post not found</h2>";
  }
}

// Load comments
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error();

    const comments = await res.json();
    commentListEl.innerHTML = comments.length ? "" : "<p class='muted'>No comments yet</p>";

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.name}</strong><p>${c.content}</p>`;
      commentListEl.appendChild(div);
    });
  } catch {
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit comment
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();
  if (!name || !content) return alert("Fill all fields");

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
  } catch {
    alert("Comment failed");
  }
});

// Init
loadPost();
loadComments();
