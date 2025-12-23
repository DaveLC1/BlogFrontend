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
const savePost = document.getElementById("savePost");

let editingId = null;

/* ================= AUTH ================= */

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
  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Login failed");
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

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };
}

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

/* ================= EDIT ================= */

window.editPost = async (id) => {
  const res = await fetch(`${API_BASE}/api/posts/id/${id}`);
  const post = await res.json();

  editingId = id;
  titleInput.value = post.title;
  quill.root.innerHTML = post.content;
};

/* ================= DELETE ================= */

window.deletePost = async (id) => {
  if (!confirm("Delete post?")) return;

  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadPosts();
};

/* ================= SAVE ================= */

savePost.onclick = async () => {
  let content = quill.root.innerHTML;

  const images = content.match(/<img[^>]+src="data:image\/[^"]+"[^>]*>/g) || [];

  for (const img of images) {
    const base64 = img.match(/src="([^"]+)"/)[1];
    const blob = await (await fetch(base64)).blob();

    const fd = new FormData();
    fd.append("image", blob);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    const data = await res.json();
    content = content.replace(img, `<img src="${data.url}">`);
  }

  const payload = {
    title: titleInput.value.trim(),
    content
  };

  if (!payload.title) {
    alert("Title required");
    return;
  }

  await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  alert("Post saved");
  editingId = null;
  titleInput.value = "";
  quill.root.innerHTML = "";
  loadPosts();
};};

logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

// Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post..."
});

// Image handler - local preview from device
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

// Save post - upload local images to Cloudinary on save
savePost.onclick = async () => {
  let content = quill.root.innerHTML;

  const localImages = content.match(/<img[^>]+src="data:image\/[^"]+"[^>]*>/g) || [];

  if (localImages.length > 0) {
    savePost.disabled = true;
    savePost.textContent = "Uploading images to Cloudinary...";

    for (const imgTag of localImages) {
      const base64 = imgTag.match(/src="data:image\/[^;]+;base64,([^"]+)"/)[1];

      const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();

      const formData = new FormData();
      formData.append("image", blob, "image.png");

      try {
        const res = await fetch(`${API_BASE}/api/upload`, { // Your route
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();

        if (data.url) {
          content = content.replace(imgTag, `<img src="${data.url}" alt="Post image">`);
        }
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        alert("Image upload failed");
      }
    }

    savePost.textContent = "Saving post...";
  }

  const payload = {
    title: title.value.trim(),
    content
  };

  if (!payload.title) return alert("Title required");

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

    alert("Posted successfully! Images on Cloudinary 🎉");
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
};};

logout.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

// Quill editor with toolbar including image
const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Write your post...",
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"], // Image button enabled
      ["clean"]
    ]
  }
});

// Custom handler for device image upload (instant preview)
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
      quill.insertEmbed(range.index, "image", e.target.result); // Instant preview
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
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
