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

// Auto-login
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
    body: JSON.stringify({ username: username.value, password: password.value })
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

/* ========== Quill Editor ========== */

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

// Custom image handler for device upload & preview
function imageHandler() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // Instant preview
    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", reader.result);
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
  };
}

/* ========== Load Posts ========== */

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

/* ========== Edit / Delete ========== */

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

/* ========== Save Post + Upload Images ========== */

savePost.onclick = async () => {
  let content = quill.root.innerHTML;

  // Find local images in base64
  const localImages = content.match(/<img[^>]+src="data:image\/[^"]+"[^>]*>/g) || [];

  if (localImages.length > 0) {
    savePost.disabled = true;
    savePost.textContent = `Uploading ${localImages.length} image(s)...`;

    for (const imgTag of localImages) {
      const base64 = imgTag.match(/src="data:image\/[^;]+;base64,([^"]+)"/)[1];
      const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();

      const formData = new FormData();
      formData.append("image", blob, "image.png");

      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        if (data.url) content = content.replace(imgTag, `<img src="${data.url}" alt="Post image">`);
      } catch (err) {
        alert("Image upload failed");
        savePost.disabled = false;
        savePost.textContent = "Save Post";
        return;
      }
    }
  }

  const payload = { title: title.value.trim(), content };
  if (!payload.title) return alert("Title required");

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API_BASE}/api/posts/${editingId}` : `${API_BASE}/api/posts`;

  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    alert("Post saved successfully!");
    editingId = null;
    title.value = "";
    quill.root.innerHTML = "";
    loadPosts();
  } catch {
    alert("Failed to save post");
  } finally {
    savePost.disabled = false;
    savePost.textContent = "Save Post";
  }
};
