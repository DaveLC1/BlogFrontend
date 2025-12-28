import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

// Clean slug
const slug = location.pathname.replace(/^\/|\/$/g, "").toLowerCase();

let postId = null;

/* ================= LOAD POST ================= */

if (!slug) {
  postContentEl.innerHTML =
    "<h2>No post selected</h2><a href='/' class='home'>← Home</a>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      postId = post.id;

      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Style images
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "88%";
        img.style.margin = "24px auto";
        img.style.display = "block";
        img.style.borderRadius = "10px";
      });

      document.getElementById("shareBtn").onclick = () =>
        navigator.clipboard.writeText(location.href);

      loadComments(postId);
    })
    .catch(() => {
      postContentEl.innerHTML =
        "<h2>Post not found</h2><a href='/' class='home'>← Home</a>";
    });
}

/* ================= LOAD COMMENTS ================= */

async function loadComments(id) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${id}`);
    const comments = await res.json();

    commentListEl.innerHTML = comments.length
      ? ""
      : "<p class='muted'>No comments yet. Be the first!</p>";

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
    commentListEl.innerHTML =
      "<p class='muted'>Failed to load comments</p>";
  }
}

/* ================= SUBMIT COMMENT ================= */

commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content || !postId) return;

  try {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postId,   // 🔥 FIXED FIELD NAME
        name,
        content
      })
    });

    if (!res.ok) throw new Error("Failed");

    nameInput.value = "";
    contentInput.value = "";

    await loadComments(postId); // reload list
  } catch (err) {
    console.error("Comment error:", err);
    alert("Failed to post comment");
  }
});
