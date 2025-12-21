import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");
const loginBox = document.getElementById("loginBox");
const dash = document.getElementById("dashboard");

if (token) {
  loginBox.hidden = true;
  dash.hidden = false;
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

// ========================
// QUILL EDITOR SETUP
// ========================
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

let editingId = null;

// ========================
// IMAGE HANDLER
// ========================
function imageHandler() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    // Convert to Data URL to show immediately in editor
    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", reader.result, "user");
    };
    reader.readAsDataURL(file);

    // Optional: upload to backend in parallel
    const formData = new FormData();
    formData.append("image", file);

    fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log("Uploaded image URL:", data.url);
        // Optionally replace the Data URL with real URL from backend
      })
      .catch(err => console.error("Upload failed:", err));
  };
}

// ========================
// POSTS HANDLING
// ========================
async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();
  postList.innerHTML = "";

  posts.forEach(p => {
    postList.innerHTML += `
      <div class="admin-post">
        ${p.title}
        <button onclick="editPost('${p.id}')">✏️</button>
        <button onclick="deletePost('${p.id}')">🗑</button>
      </div>
    `;
  });
}

window.editPost = async id => {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const p = await res.json();
  editingId = id;
  title.value = p.title;
  quill.root.innerHTML = p.content;
};

window.deletePost = async id => {
  if (!confirm("Delete post?")) return;
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  loadPosts();
};

savePost.onclick = async () => {
  const payload = {
    title: title.value,
    content: quill.root.innerHTML
  };

  const url = editingId
    ? `${API_BASE}/api/posts/${editingId}`
    : `${API_BASE}/api/posts`;

  await fetch(url, {
    method: editingId ? "PUT" : "POST",
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
