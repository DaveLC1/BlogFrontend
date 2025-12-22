import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const search = document.getElementById("search");
const adminGate = document.getElementById("adminGate");

let allPosts = [];

/* ================= LOAD POSTS ================= */

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();

    allPosts = data;
    renderPosts(data);
  } catch (err) {
    postsEl.innerHTML = "<p>Failed to load posts.</p>";
  }
}

function renderPosts(posts) {
  postsEl.innerHTML = "";

  posts.forEach(p => {
    const views = Math.floor(Math.random() * 25_000_000) + " views";

    postsEl.innerHTML += `
      <div class="card" data-id="${p.id}">
        <img src="images/post.jpg" alt="post">
        <div>
          <h3>${p.title}</h3>
          <small class="post-date">
            ${new Date(p.created_at).toDateString()}
            <span style="float:right; color:#9ca3af; font-size:12px">
              ${views}
            </span>
          </small>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".card").forEach(card => {
    card.onclick = () => {
      location.href = `post.html?id=${card.dataset.id}`;
    };
  });
}

/* ================= SEARCH ================= */

search.oninput = () => {
  const q = search.value.toLowerCase();
  renderPosts(allPosts.filter(p =>
    p.title.toLowerCase().includes(q)
  ));
};

/* ================= ADMIN GATE ================= */

let tap = 0;
adminGate.onclick = () => {
  tap++;
  setTimeout(() => tap = 0, 500);
  if (tap === 2) location.href = "admin.html";
};

loadPosts();  });
}

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(posts.filter(p => p.title.toLowerCase().includes(q)));
};

loadPosts();
