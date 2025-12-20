import { API_BASE } from "./config.js";

const q=new Quill("#editor",{theme:"snow"});
const t=localStorage.getItem("token");
const id=new URLSearchParams(location.search).get("id");

if(id){
 fetch(`${API_BASE}/api/posts/${id}`).then(r=>r.json()).then(p=>{
  title.value=p.title;
  q.root.innerHTML=p.content;
 });
}

save.onclick=async()=>{
 await fetch(`${API_BASE}/api/posts${id?"/"+id:""}`,{
  method:id?"PUT":"POST",
  headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
  body:JSON.stringify({title:title.value,content:q.root.innerHTML})
 });
 location.href="dashboard.html";
};
