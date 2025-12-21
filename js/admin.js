const API = "https://backend-x16b.onrender.com";
const token = localStorage.getItem("token");

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const postList = document.getElementById("postList");
const saveBtn = document.getElementById("savePost");

let editingPostId = null;

const quill = new Quill("#editor", { theme: "snow" });

/* ---------------- LOGIN ---------------- */

loginBtn.onclick = async () => {
  const username = username.value.trim();
  const password = password.value.trim();

  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) return alert("Login failed");

  localStorage.setItem("token", data.token);
  loginBox.hidden = true;
  dashboard.hidden = false;

  loadPosts();
};

/* ---------------- LOAD POSTS ---------------- */

async function loadPosts() {
  postList.innerHTML = "Loading...";

  const res = await fetch(`${API}/api/posts`);
  const posts = await res.json();

  postList.innerHTML = "";

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
      <strong>${p.title}</strong>
      <br>
      <small>${new Date(p.created_at).toDateString()}</small>
      <br><br>
      <button onclick="editPost('${p.id}')">✏ Edit</button>
      <button onclick="deletePost('${p.id}')">🗑 Delete</button>
      <button onclick="reply('${p.id}')">💬 Reply</button>
    `;

    postList.appendChild(div);
  });
}

/* ---------------- CREATE / UPDATE ---------------- */

saveBtn.onclick = async () => {
  const title = document.getElementById("title").value;
  const content = quill.root.innerHTML;

  const method = editingPostId ? "PUT" : "POST";
  const url = editingPostId
    ? `${API}/api/posts/${editingPostId}`
    : `${API}/api/posts`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });

  if (!res.ok) return alert("Save failed");

  editingPostId = null;
  quill.setText("");
  title.value = "";

  loadPosts();
};

/* ---------------- EDIT ---------------- */

window.editPost = async (id) => {
  const res = await fetch(`${API}/api/posts/${id}`);
  const post = await res.json();

  editingPostId = id;
  title.value = post.title;
  quill.root.innerHTML = post.content;
};

/* ---------------- DELETE ---------------- */

window.deletePost = async (id) => {
  if (!confirm("Delete this post?")) return;

  const res = await fetch(`${API}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return alert("Delete failed");

  loadPosts();
};

/* ---------------- ADMIN REPLY (VISUAL ONLY) ---------------- */

window.reply = (postId) => {
  const msg = prompt("Admin reply (visual only):");
  if (!msg) return;

  alert("Reply saved (frontend only)");
};
