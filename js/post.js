import { API_BASE } from "./config.js";
import { views } from "./utils.js";

const id = new URLSearchParams(location.search).get("id");
const post = document.getElementById("post");

fetch(`${API_BASE}/api/posts/${id}`)
  .then(r=>r.json())
  .then(p=>{
    post.innerHTML = `
      <h1>${p.title}</h1>
      <div class="meta">${new Date(p.created_at).toDateString()} · 👁 ${views(id)}</div>
      ${p.content}
    `;
  });

fetch(`${API_BASE}/api/comments/${id}`)
  .then(r=>r.json())
  .then(cs=>{
    commentList.innerHTML="";
    cs.forEach(c=>{
      commentList.innerHTML+=`<div class="comment"><b>${c.name}</b><p>${c.content}</p></div>`;
    });
  });

commentForm.onsubmit=async e=>{
  e.preventDefault();
  await fetch(`${API_BASE}/api/comments/${id}`,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:name.value,content:content.value})
  });
  location.reload();
};
