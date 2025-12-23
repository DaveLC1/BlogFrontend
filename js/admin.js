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

// Fixed login - flexible response handling
loginBtn.onclick = async () => {
  const usernameValue = username.value.trim();
  const passwordValue = password.value;

  if (!usernameValue || !passwordValue) return alert("Enter username and password");

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameValue,
        password: passwordValue
      })
    });

    if (!res.ok) throw new Error("Wrong credentials or server error");

    const data = await res.json();
    console.log("Login response:", data); // Check console for what backend returns

    // Store token if present (any key)
    const tokenValue = data.token || data.access_token || data.jwt || "logged_in";
    localStorage.setItem("token", tokenValue);

    location.reload();
  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
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

// Image handler - device upload, instant preview
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
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
  };
});

// Load posts
async function loadPosts() {
  try {
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
  } catch {
    postList.innerHTML = "<p>Failed to load posts</p>";
  }
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

  savePost.disabled = true;
  savePost.textContent = "Posting, please wait...";

  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/api/posts/${editingId}` : `${API_BASE}/api/posts`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();

    alert("Posted successfully! 🎉");
    editingId = null;
    title.value = "";
    quill.root.innerHTML = "";
    loadPosts();
  } catch {
    alert("Failed to post");
  } finally {
    savePost.disabled = false;
    savePost.textContent = "Save Post";
  }
};
