import { API_BASE } from "./config.js";

const slug = new URLSearchParams(location.search).get("slug");
const el = document.getElementById("post");

fetch(`${API_BASE}/api/posts`)
  .then(r => r.json())
  .then(d => {
    const p = d.posts.find(x => x.slug === slug);
    el.innerHTML = `
      <h1>${p.title}</h1>
      <p>𓁼 ${(Math.random()*3+2).toFixed(1)}M views</p>
      <div>${p.content}</div>
    `;
  });