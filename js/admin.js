import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const username = document.getElementById("username");
const password = document.getElementById("password");
const logout = document.getElementById("logout");
const postList = document.getElementById("postList");
const titleInput = document.getElementById("title");
const savePostBtn = document.getElementById("savePost");

let editingId = null;

// Show dashboard if logged in
if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadPosts();
}

// Login
loginBtn.onclick = async () => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value.trim(),
      password: password.value
    })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Login failed — wrong credentials");
  }
};

// Logout
logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

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

// Image upload handler — uploads to Cloudinary via your backend
quill.getModule("toolbar").addHandler("image", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // Insert temporary placeholder
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "image", "https://i.imgur.com/ZoV8b0K.gif"); // loading gif

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // if your backend requires auth
        },
        body: formData
      });

      const data = await res.json();

      if (data.url) {
        // Replace placeholder with real Cloudinary URL
        quill.deleteText(range.index, 1);
        quill.insertEmbed(range.index, "image", data.url);
      } else {
        alert("Upload failed");
        quill.deleteText(range.index, 1); // remove placeholder
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed");
      quill.deleteText(range.index, 1);
    }
  };
});

// Load all posts in admin list
async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();

  postList.innerHTML = posts.length === 0
    ? "<p>No posts yet</p>"
    : "";

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "admin-post";
    div.innerHTML = `
      <span>${p.title}</span>
      <div>
        <button onclick="editPost('${p.id}')">✏️ Edit</button>
        <button onclick="deletePost('${p.id}')">🗑 Delete</button>
      </div>
    `;
    postList.appendChild(div);
  });
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

  loadPosts();
};

// Save post (create or update)
savePostBtn.onclick = async () => {
  const payload = {
    title: titleInput.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title) {
    alert("Title is required");
    return;
  }

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
  loadPosts();
};
