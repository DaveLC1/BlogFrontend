import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const postList = document.getElementById("postList");

const quill = new Quill("#editor", { theme: "snow" });

let editingId = null;

/* ================= LOGIN ================= */
document.getElementById("loginBtn").onclick = async () => {
  const username = username.value;
  const password = password.value;

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!data.token) return alert("Login failed");

  localStorage.setItem("token", data.token);
  location.reload();
};

/* ================= AUTH CHECK ================= */
if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadPosts();
}

/* ================= LOAD POSTS ================= */
async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();

  postList.innerHTML = "";
  posts.forEach(p => {
    postList.innerHTML += `
      <div class="comment">
        <b>${p.title}</b>
        <button onclick="editPost('${p.id}')">Edit</button>
        <button onclick="deletePost('${p.id}')">Delete</button>
      </div>
    `;
  });
}

/* ================= CREATE ================= */
window.createNew = () => {
  editingId = null;
  title.value = "";
  quill.root.innerHTML = "";
};

/* ================= EDIT ================= */
window.editPost = async (id) => {
  editingId = id;
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const post = await res.json();

  title.value = post.title;
  quill.root.innerHTML = post.content;
};

/* ================= SAVE ================= */
savePost.onclick = async () => {
  const payload = {
    title: title.value,
    content: quill.root.innerHTML
  };

  const url = editingId
    ? `${API_BASE}/api/posts/${editingId}`
    : `${API_BASE}/api/posts`;

  const method = editingId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  loadPosts();
};

/* ================= DELETE ================= */
window.deletePost = async (id) => {
  if (!confirm("Delete post?")) return;

  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadPosts();
};
