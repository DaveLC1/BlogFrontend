import { API_BASE } from "./config.js";
const token = localStorage.token;
const list = document.getElementById("list");

fetch(`${API_BASE}/api/posts`)
  .then(r=>r.json())
  .then(d=>{
    d.posts.forEach(p=>{
      list.innerHTML += `
        <div>
          ${p.title}
          <button onclick="edit('${p.id}')">Edit</button>
          <button onclick="del('${p.id}')">Delete</button>
        </div>`;
    });
  });

window.edit = id => location.href = `admin-editor.html?id=${id}`;
window.del = async id => {
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method:"DELETE",
    headers:{Authorization:`Bearer ${token}`}
  });
  location.reload();
};