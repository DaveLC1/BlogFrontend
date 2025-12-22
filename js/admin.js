import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logout");
const postList = document.getElementById("postList");
const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("savePost");

let editingId = null;

// Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post content...",
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"]
    ]
  }
});

// Custom image handler (preview immediately)
quill.getModule("toolbar").addHandler("image", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", e.target.result);
    };
    reader.readAsDataURL(file);
  };
});

// Show dashboard if logged in
if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadAdminPosts();
}

// Login
loginBtn.onclick = async () => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value
    })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Login failed");
  }
};

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

// Load posts in admin
async function loadAdminPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();

  postList.innerHTML = posts.map(p => `
    <div class="admin-post">
      <span>${p.title}</span>
      <div>
        <button onclick="editPost('${p.id}')">✏️</button>
        <button onclick="deletePost('${p.id}')">🗑</button>
      </div>
    </div>
  `).join("");
}

// Global functions for buttons
window.editPost = async (id) => {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const post = await res.json();

  editingId = id;
  titleInput.value = post.title;
  quill.root.innerHTML = post.content;
};

window.deletePost = async (id) => {
  if (!confirm("Delete this post permanently?")) return;

  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadAdminPosts();
};

// Save post
saveBtn.onclick = async () => {
  const payload = {
    title: titleInput.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title) return alert("Title is required");

  const method = editingId ? "PUT" : "POST";
  const url = editingId 
    ? `${API_BASE}/api/posts/${editingId}`
    : `${API_BASE}/api/posts`;

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // Reset form
  editingId = null;
  titleInput.value = "";
  quill.root.innerHTML = "";
  loadAdminPosts();
};
