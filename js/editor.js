import { API_BASE } from "./config.js";

const token = localStorage.getItem("token");
if (!token) {
  alert("Unauthorized");
  location.href = "admin.html";
}

/* =========================
   QUILL SETUP
========================= */
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

/* =========================
   IMAGE UPLOAD HANDLER
========================= */
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
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!data.url) throw new Error("Upload failed");

      const range = quill.getSelection();
      quill.insertEmbed(range.index, "image", data.url);
    } catch (err) {
      alert("Image upload failed");
    }
  };
}

/* =========================
   CREATE / EDIT POST
========================= */
const form = document.getElementById("postForm");
const titleInput = document.getElementById("title");

const params = new URLSearchParams(location.search);
const editId = params.get("id"); // ?id=POST_ID

// LOAD POST FOR EDIT
if (editId) {
  fetch(`${API_BASE}/api/posts/${editId}`)
    .then(res => res.json())
    .then(post => {
      titleInput.value = post.title;
      quill.root.innerHTML = post.content;
    });
}

// SUBMIT
form.onsubmit = async (e) => {
  e.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    content: quill.root.innerHTML
  };

  if (!payload.title || payload.content.length < 20) {
    alert("Content too short");
    return;
  }

  const url = editId
    ? `${API_BASE}/api/posts/${editId}`
    : `${API_BASE}/api/posts`;

  const method = editId ? "PUT" : "POST";

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

  location.href = "dashboard.html";
};
