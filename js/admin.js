import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const username = document.getElementById("username");
const password = document.getElementById("password");
const logout = document.getElementById("logout");
const postList = document.getElementById("postList");
const title = document.getElementById("title");
const savePost = document.getElementById("savePost");

let editingId = null;

if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadPosts();
}

loginBtn.onclick = async () => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();
  if (!data.token) return alert("Login failed");

  localStorage.setItem("token", data.token);
  location.reload();
};

logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

// Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post..."
});

// Image handler - local preview + upload to Cloudinary
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
      quill.insertEmbed(range.index, "image", e.target.result); // Immediate local preview
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);

    // Upload in parallel to backend/Cloudinary
    const formData = new FormData();
    formData.append("image", file);

    fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // if needed
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          // Replace local preview with Cloudinary URL
          const range = quill.getSelection();
          const img = quill.root.querySelector(`img[src^="${reader.result.substring(0, 50)}"]`); // approximate match
          if (img) img.src = data.url;
        }
      })
      .catch(err => {
        console.error("Cloudinary upload failed:", err);
        // Keep local preview if upload fails
      });
  };
});

// Load posts
async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();
  postList.innerHTML = "";

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "admin-post";
    div.innerHTML = `
      <span>${p.title}</span>
      <div>
        <button onclick="editPost('${p.id}')">✏️</button>
        <button onclick="deletePost('${p.id}')">🗑</button>
      </div>
    `;
    postList.appendChild(div);
  });
}

window.editPost = async (id) => {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const p = await res.json();
  editingId = id;
  title.value = p.title;
  quill.root.innerHTML = p.content;
};

window.deletePost = async (id) => {
  if (!confirm("Delete post?")) return;
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  loadPosts();
};

savePost.onclick = async () => {
  const payload = {
    title: title.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title) return alert("Title required");

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API_BASE}/api/posts/${editingId}` : `${API_BASE}/api/posts`;

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  editingId = null;
  title.value = "";
  quill.root.innerHTML = "";
  loadPosts();
};
