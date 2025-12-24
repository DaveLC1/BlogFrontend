import { API_BASE } from "./config.js";

/* ================= AUTH / DOM ================= */

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

/* ================= AUTO LOGIN ================= */

if (token) {
  loginBox.hidden = true;
  dashboard.hidden = false;
  loadPosts();
}

/* ================= LOGIN ================= */

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
  if (!data.token) return alert("Login failed");

  localStorage.setItem("token", data.token);
  location.reload();
};

logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

/* =================================================
   ✅ QUILL (UPGRADED WITH FULL TOOLBAR)
================================================= */

const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post...",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"]
    ]
  }
});

/* ================= IMAGE PICKER (PREVIEW ONLY) ================= */

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
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", reader.result);
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file); // preview only
  };
}

// Attach custom image handler
const toolbar = quill.getModule("toolbar");
toolbar.addHandler("image", imageHandler);

/* ================= LOAD POSTS ================= */

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

/* ================= EDIT POST ================= */

window.editPost = async (id) => {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const post = await res.json();

  editingId = id;
  title.value = post.title;
  quill.root.innerHTML = post.content;
};

/* ================= DELETE POST ================= */

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

/* =================================================
   ✅ SAVE POST — UPLOAD IMAGES TO CLOUDINARY
================================================= */

savePost.onclick = async () => {
  let content = quill.root.innerHTML;

  // Find base64 images
  const images = content.match(/<img[^>]+src="data:image\/[^"]+"[^>]*>/g) || [];

  savePost.disabled = true;

  for (const img of images) {
    const base64 = img.match(/src="([^"]+)"/)[1];
    const blob = await (await fetch(base64)).blob();

    const formData = new FormData();
    formData.append("image", blob, "image.png");

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (!data.url) {
      alert("Image upload failed");
      savePost.disabled = false;
      return;
    }

    content = content.replace(img, `<img src="${data.url}">`);
  }

  const payload = {
    title: title.value.trim(),
    content
  };

  if (!payload.title) {
    alert("Title required");
    savePost.disabled = false;
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

  alert("Post saved successfully 🎉");

  editingId = null;
  title.value = "";
  quill.root.innerHTML = "";
  savePost.disabled = false;

  loadPosts();
};
