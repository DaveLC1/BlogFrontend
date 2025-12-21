import { API_BASE } from "./config.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");

const postEl = document.getElementById("post-content");
const list = document.getElementById("commentList");

fetch(`${API_BASE}/api/posts/${id}`)
  .then(r => r.json())
  .then(p => {
    postEl.innerHTML = `
      <h1>${p.title}</h1>
      <p class="post-date">${new Date(p.created_at).toDateString()}</p>
      ${p.content}
    `;
  });

fetch(`${API_BASE}/api/comments/${id}`)
  .then(r => r.json())
  .then(comments => render(comments));

function render(comments) {
  list.innerHTML = "";
  comments.forEach(c => {
    list.innerHTML += `
      <div class="comment">
        <strong>${c.name}</strong>
        <p>${c.content}</p>
        <button onclick="reply(this)">Reply</button>
      </div>
    `;
  });
}

window.reply = (btn) => {
  const div = document.createElement("div");
  div.className = "reply";
  div.innerHTML = `
    <p class="admin">Admin</p>
    <textarea placeholder="Reply..."></textarea>
  `;
  btn.parentElement.appendChild(div);
};
