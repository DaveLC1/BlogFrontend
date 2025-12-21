import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");

// loading state
postsEl.innerHTML = `
  <div class="loading">
    <img src="images/loading.gif" />
    <p>Please wait…</p>
  </div>
`;

let allPosts = [];

fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data;
    renderPosts(data);
  })
  .catch(() => {
    postsEl.innerHTML = "Failed to load posts";
  });

function renderPosts(posts) {
  postsEl.innerHTML = "";

  posts.forEach(p => {
    const views = Math.floor(Math.random() * 25_000_000) + " views";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${p.title}</h3>
      <div class="muted">
        ${new Date(p.created_at).toDateString()}
        <span class="views">𓁼${views}</span>
      </div>
    `;

    card.onclick = () => {
      location.href = `post.html?id=${p.id}`;
    };

    postsEl.appendChild(card);
  });
}

// search
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase();
  renderPosts(allPosts.filter(p => p.title.toLowerCase().includes(q)));
};

// secret admin access
let tapCount = 0;
document.getElementById("adminGate").onclick = () => {
  tapCount++;
  setTimeout(() => (tapCount = 0), 600);
  if (tapCount === 2) location.href = "admin.html";
};  });
}

search.oninput = e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? "" : "none";
  });
};

loadPosts();
