import { API_BASE } from "./config.js";

/* ======================
   ELEMENTS
====================== */
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logout");

const postList = document.getElementById("postList");
const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("savePost");

/* ======================
   AUTH
====================== */
const token = localStorage.getItem("token");

if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadPosts();
}

/* ======================
   LOGIN
====================== */
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

  if (!data.token) {
    alert("Login failed");
    return;
  }

  localStorage.setItem("token", data.token);
  location.reload();
};

/* ======================
   LOGOUT
====================== */
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

/* ======================
   QUILL (WITH IMAGE SUPPORT)
====================== */
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post...",
  modules: {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"]
      ],
      handlers: {
        image: imageHandler
      }
    }
  }
});

function imageHandler() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection();
      quill.insertEmbed(range.index, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };
}

/* ======================
   POSTS
====================== */
let editingId = null;

async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();

  postList.innerHTML = "";

  posts.forEach(p => {
    postList.innerHTML += `
      <div class="admin-post">
        <b>${p.title}</b>
        <button onclick="editPost('${p.id}')">✏️</button>
        <button onclick="deletePost('${p.id}')">🗑</button>
      </div>
    `;
  });
}

/* ======================
   EDIT
====================== */
window.editPost = async id => {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const post = await res.json();

  editingId = id;
  titleInput.value = post.title;
  quill.root.innerHTML = post.content;
};

/* ======================
   DELETE
====================== */
window.deletePost = async id => {
  if (!confirm("Delete this post?")) return;

  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadPosts();
};

/* ======================
   SAVE (CREATE / UPDATE)
====================== */
saveBtn.onclick = async () => {
  const payload = {
    title: titleInput.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title || payload.content.length < 20) {
    alert("Content too short");
    return;
  }

  const url = editingId
    ? `${API_BASE}/api/posts/${editingId}`
    : `${API_BASE}/api/posts`;

  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert("Failed to save post");
    return;
  }

  editingId = null;
  titleInput.value = "";
  quill.root.innerHTML = "";

  loadPosts();
};
