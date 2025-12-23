import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(location.search);
const postId = params.get("id");

if (!postId) {
  postEl.innerHTML = "Post not found";
  throw new Error("Missing post id");
}

/* ================= LOAD POST ================= */

fetch(`${API_BASE}/api/posts/id/${postId}`)
  .then(res => res.json())
  .then(post => {
    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      ${post.content}
    `;
  })
  .catch(() => {
    postEl.innerHTML = "Error loading post";
  });

/* ================= LOAD COMMENTS ================= */

function loadComments() {
  fetch(`${API_BASE}/api/comments/${postId}`)
    .then(res => res.json())
    .then(comments => {
      commentList.innerHTML = "";

      comments.forEach(c => {
        commentList.innerHTML += `
          <div class="comment">
            <strong>${c.name}</strong>
            <p>${c.content}</p>

            <div class="admin-reply">
              <button class="toggle-reply">Admin reply ▾</button>
              <div class="reply-box">
                <div class="admin-badge">ADMIN</div>
                <p>This is an official admin response.</p>
              </div>
            </div>
          </div>
        `;
      });

      attachToggle();
    });
}

function attachToggle() {
  document.querySelectorAll(".toggle-reply").forEach(btn => {
    btn.onclick = () => {
      const box = btn.nextElementSibling;
      box.classList.toggle("open");
    };
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: name.value,
    content: content.value
  };

  const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    e.target.reset();
    loadComments();
  }
};

loadComments();  commentList.innerHTML = "";

  if (comments.length === 0) {
    commentList.innerHTML = "<p>No comments yet.</p>";
    return;
  }

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
      <strong>${c.name}</strong>
      <small>${new Date(c.created_at).toLocaleString()}</small>
      <p>${c.content}</p>
    `;
    commentList.appendChild(div);
  });
}

/* =========================
   Submit Comment
========================= */
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!name || !content) return;

  await fetch(`${API_BASE}/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, content }),
  });

  commentForm.reset();
  loadComments();
});

/* =========================
   Init
========================= */
loadPost();
