import { API_BASE } from "./config.js";
const token = localStorage.token;
const id = new URLSearchParams(location.search).get("id");

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: {
      container: [["bold","italic","image"]],
      handlers: {
        image: async () => {
          const i = document.createElement("input");
          i.type="file"; i.click();
          i.onchange=async()=>{
            const fd=new FormData();
            fd.append("image",i.files[0]);
            const r=await fetch(`${API_BASE}/api/upload`,{
              method:"POST",
              headers:{Authorization:`Bearer ${token}`},
              body:fd
            });
            const d=await r.json();
            quill.insertEmbed(quill.getLength(), "image", d.url);
          };
        }
      }
    }
  }
});

if (id) {
  fetch(`${API_BASE}/api/posts`).then(r=>r.json()).then(d=>{
    const p=d.posts.find(x=>x.id===id);
    title.value=p.title;
    quill.root.innerHTML=p.content;
  });
}

save.onclick = async () => {
  const body = JSON.stringify({ title:title.value, content:quill.root.innerHTML });
  await fetch(`${API_BASE}/api/posts${id?`/${id}`:""}`,{
    method:id?"PUT":"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body
  });
  location.href="admin-dashboard.html";
};