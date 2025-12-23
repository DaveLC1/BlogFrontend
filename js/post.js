import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");

const slug = location.pathname.slice(1).trim();

fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(posts => {
    const post = posts.find(p => p.slug === slug);
    if (post) {
      postContentEl.innerHTML = `
        <h1>${post.title}</h1>
        <div>${post.content}</div>
      `;
    } else {
      postContentEl.innerHTML = "<h2>Post not found</h2>";
    }
  });
