import { API_BASE } from "./config.js";

const postEl = document.getElementById("post-content");
const commentList = document.getElementById("commentList");
const form = document.getElementById("commentForm");

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

let post = null; // global post

if (!slug) {
  postEl.innerHTML = "<p>Post not found</p>";
  throw new Error("Missing slug");
}

/* ================= LOAD POST ================= */
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error("Post fetch failed");

    post = await res.json();
    if (!post) throw new Error("Post not found");

    postEl.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${new Date(post.created_at).toDateString()}</div>
      <div class="post-body">${post.content}</div>
    `;

    loadComments(); // load comments after post is loaded
  } catch (err) {
    postEl.innerHTML = "<p>Error loading post</p>";
    console.error(err);
  }
}

/* ================= LOAD COMMENTS ================= */
async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${post.id}`);
    if (!res.ok) throw new Error("Failed to load comments");
    const comments = await res.json();

    commentList.innerHTML = "";
    if (comments.length === 0) {
      commentList.innerHTML = "<p>No comments yet.</p>";
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.is_admin ? "Admin" : c.name}</strong>
        <small>${new Date(c.created_at).toLocaleString()}</small>
        <p>${c.content}</p>
        ${c.is_admin ? "" : `
          <div class="admin-reply">
            <button class="toggle-reply">Admin reply ▾</button>
            <div class="reply-box">
              <div class="admin-badge">ADMIN</div>
              <p>This is an official admin response.</p>
            </div>
          </div>
        `}
      `;
      commentList.appendChild(div);
    });

    attachToggle();
  } catch (err) {
    commentList.innerHTML = "<p>Failed to load comments</p>";
    console.error(err);
  }
}

/* ================= TOGGLE ADMIN REPLY ================= */
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

  const name = document.getElementById("name").value.trim();
  const content = document.getElementById("content").value.trim();
  if (!name || !content) return;

  try {
    const res = await fetch(`${API_BASE}/api/comments/${post.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error("Failed to post comment");

    form.reset();
    loadComments();
  } catch (err) {
    alert("Error submitting comment");
    console.error(err);
  }
};

/* ================= INIT ================= */
loadPost();  } catch (err) {
    postEl.innerHTML = "<p>Error loading post</p>";
    console.error(err);
  }
}

/* ================= LOAD COMMENTS ================= */

async function loadComments() {
  const res = await fetch(`${API_BASE}/api/comments/${post.id}`);
  const comments = await res.json();

  commentList.innerHTML = "";
  comments.forEach(c => {
    commentList.innerHTML += `
      <div class="comment ${c.is_admin ? "admin-reply" : ""}">
        <strong>${c.is_admin ? "Admin" : c.name}</strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

/* ================= ADD COMMENT ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    name: name.value,
    content: content.value
  };

  const res = await fetch(
    `${API_BASE}/api/comments/${slug}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  if (res.ok) {
    form.reset();
    loadComments();
  }
};

loadPost();
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
