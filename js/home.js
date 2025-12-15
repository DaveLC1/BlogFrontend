import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const search = document.getElementById("search");

document.getElementById("adminGate").ondblclick = () => {
  location.href = "admin-login.html";
};

function extractImage(html) {
  const m = html.match(/<img[^>]+src="([^">]+)"/);
  return m ? m[1] : null;
}

function fakeViews() {
  return (Math.random() * 3 + 2).toFixed(1) + "M";
}

async function load(q = "") {
  const res = await fetch(`${API_BASE}/api/posts`);
  const { posts } = await res.json();

  postsEl.innerHTML = "";

  posts
    .filter(p => p.title.toLowerCase().includes(q))
    .forEach(p => {
      const img = extractImage(p.content);
      postsEl.innerHTML += `
        <div class="card" onclick="location.href='post.html?slug=${p.slug}'">
          ${img ? `<img src="${img}">` : ""}
          <div>
            <h3>${p.title}</h3>
            <p>𓁼 ${fakeViews()}</p>
          </div>
        </div>
      `;
    });
}

search.oninput = e => load(e.target.value.toLowerCase());
load();