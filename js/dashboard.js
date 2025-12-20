import { API_BASE } from "./config.js";

const t=localStorage.getItem("token");
fetch(`${API_BASE}/api/posts`,{headers:{Authorization:`Bearer ${t}`}})
.then(r=>r.json())
.then(ps=>{
  list.innerHTML="";
  ps.forEach(p=>{
    list.innerHTML+=`
      <div>
        ${p.title}
        <a href="editor.html?id=${p.id}">Edit</a>
      </div>`;
  });
});
