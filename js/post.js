import { API_BASE } from "./config.js";

const id = new URLSearchParams(location.search).get("id");

const postBox = document.getElementById("post-content");
const commentList = document.getElementById("commentList");

async function loadPost() {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  const post = await res.json();

  postBox.innerHTML = `
    <h1>${post.title}</h1>
    <small class="muted">${new Date(post.created_at).toDateString()}</small>
    <div>${post.content}</div>
  `;
}

async function loadComments() {
  const res = await fetch(`${API_BASE}/api/posts/${id}/comments`);
  const comments = await res.json();

  commentList.innerHTML = "";
  comments.forEach(c => {
    commentList.innerHTML += `
      <div class="comment">
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      </div>
    `;
  });
}

document.getElementById("commentForm").onsubmit = async e => {
  e.preventDefault();
  await fetch(`${API_BASE}/api/posts/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      content: content.value
    })
  });
  e.target.reset();
  loadComments();
};

loadPost();
loadComments();
