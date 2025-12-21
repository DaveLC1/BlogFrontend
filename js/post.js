import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.innerHTML = "Post not found";
  throw new Error("Missing post id in URL");
}

/* ================= LOAD POST ================= */
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const post = await res.json();
    if (!post) throw new Error("Post not found");

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content}
    `;
  } catch (err) {
    console.error("Error loading post:", err);
    postEl.innerHTML = "Error loading post";
  }
}

/* ================= LOAD COMMENTS ================= */
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    const comments = await res.json();

    commentList.innerHTML = "";
    comments.forEach(c => {
      commentList.innerHTML += `
        <div class="comment">
          <strong>${c.name}</strong>
          <p>${c.content}</p>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error loading comments:", err);
    commentList.innerHTML = "<p>Failed to load comments</p>";
  }
}

/* ================= ADD COMMENT ================= */
form.onsubmit = async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const content = document.getElementById("content").value.trim();
  if (!name || !content) return alert("Please fill all fields");

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error("Failed to submit comment");

    document.getElementById("name").value = "";
    document.getElementById("content").value = "";
    loadComments();
  } catch (err) {
    console.error("Error submitting comment:", err);
    alert("Failed to submit comment");
  }
};

/* ================= INIT ================= */
loadPost();
loadComments();    // Load comments after post
    loadComments();

  } catch (err) {
    document.body.innerHTML = "<h2>Post not found</h2>";
    console.error(err);
  }
}

/* =========================
   IMAGE FIX (VERY IMPORTANT)
========================= */
function fixImages(container) {
  const images = container.querySelectorAll("img");

  images.forEach(img => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "20px auto";
    img.style.borderRadius = "10px";
  });
}

/* =========================
   LOAD COMMENTS
========================= */
async function loadComments() {
  if (!postId) return;

  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
  const comments = await res.json();

  const list = document.getElementById("commentList");
  list.innerHTML = "";

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
      <strong>${c.name}</strong>
      <p>${c.content}</p>
      <small>${new Date(c.created_at).toLocaleString()}</small>
    `;

    list.appendChild(div);
  });
}

/* =========================
   SUBMIT COMMENT
========================= */
const form = document.getElementById("commentForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!postId) return;

    const name = document.getElementById("commentName").value.trim();
    const content = document.getElementById("commentText").value.trim();

    if (!name || !content) return;

    await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    form.reset();
    loadComments();
  });
}

/* =========================
   INIT
========================= */
loadPost();
