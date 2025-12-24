import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const slug = location.pathname.slice(1).trim().toLowerCase();

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html' class='home'>← Home</a>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error();

      postContentEl.innerHTML = `
        <p class="muted">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
      `;

      loadComments(post.id);
    })
    .catch(() => {
      postContentEl.innerHTML = "<h2>Post not found</h2>";
    });
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    const comments = await res.json();

    commentListEl.innerHTML = comments.length === 0 
      ? "<p class='muted'>No comments yet</p>" 
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
    loadComments(postId);
  } catch {
    alert("Comment failed");
  }
});
