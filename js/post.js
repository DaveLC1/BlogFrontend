import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

const slug = location.pathname.slice(1).toLowerCase();

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error();

      postContentEl.innerHTML = `
        <p class="muted">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      document.getElementById("shareBtn").onclick = () =>
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied 📋"));

      loadComments(post.id);

      commentForm.onsubmit = async e => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const content = contentInput.value.trim();
        if (!name || !content) return;

        await fetch(`${API_BASE}/api/comments/${post.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, content })
        });

        nameInput.value = "";
        contentInput.value = "";
        loadComments(post.id);
      };
    })
    .catch(() => {
      postContentEl.innerHTML = "<h2>Post not found</h2>";
    });
}

async function loadComments(postId) {
  const res = await fetch(`${API_BASE}/api/comments/${postId}`);
  const comments = await res.json();

  commentListEl.innerHTML = comments.length
    ? ""
    : "<p class='muted'>No comments yet</p>";

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<strong>${c.name}</strong><p>${c.content}</p>`;
    commentListEl.appendChild(div);
  });
}
