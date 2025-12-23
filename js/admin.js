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
      body: JSON.stringify({
        username: usernameValue,
        password: passwordValue
      })
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

/* =================================================
   ✅ QUILL — FIXED PROPERLY
================================================= */

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

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", reader.result);
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
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
  const url = editingId
    ? `${API_BASE}/api/posts/${editingId}`
    : `${API_BASE}/api/posts`;

  try {
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    alert("Post saved");
    editingId = null;
    title.value = "";
    quill.root.innerHTML = "";
    loadPosts();
  } catch {
    alert("Failed to save post");
  }
};  const res = await fetch(`${API_BASE}/api/posts/${id}`);
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

// Save post with Cloudinary upload on save
savePost.onclick = async () => {
  let content = quill.root.innerHTML;

  // Find local base64 images
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

        if (data.url) {
          content = content.replace(imgTag, `<img src="${data.url}" alt="Uploaded image">`);
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("One image failed to upload");
      }
    }

    savePost.textContent = "Saving post...";
  }

  const payload = {
    title: title.value.trim(),
    content
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

    alert("Posted successfully with images! 🎉");
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
