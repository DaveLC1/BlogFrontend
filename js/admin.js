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
  const usernameValue = username.value.trim();
  const passwordValue = password.value;

  if (!usernameValue || !passwordValue) {
    alert("Enter username and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameValue, password: passwordValue })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      location.reload();
    } else {
      alert("Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

/* ================= QUILL ================= */
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post...",
  modules: {
    toolbar: {
      container: "#toolbar",
      handlers: {
        image: imageHandler
      }
    }
  }
});

/* ================= IMAGE HANDLER ================= */
function imageHandler() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.url) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", data.url);
        quill.setSelection(range.index + 1);
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload error");
    }
  };
}

/* ================= LOAD POSTS ================= */
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

/* ================= EDIT / DELETE ================= */
window.editPost = async (id) => {
  const res = await fetch(`${API_BASE}/api/posts/id/${id}`);
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

/* ================= SAVE POST ================= */
savePost.onclick = async () => {
  const payload = {
    title: title.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title) {
    alert("Title required");
    return;
  }

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API_BASE}/api/posts/${editingId}` : `${API_BASE}/api/posts`;

  try {
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    alert("Post saved successfully!");
    editingId = null;
    title.value = "";
    quill.root.innerHTML = "";
    loadPosts();
  } catch (err) {
    console.error(err);
    alert("Failed to save post");
  }
};load.title) return alert("Title required");

  savePost.disabled = true;
  savePost.textContent = "Posting, please wait...";

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API_BASE}/api/posts/${editingId}` : `${API_BASE}/api/posts`;

  try {
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

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
