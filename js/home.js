const API = "https://backend-x16b.onrender.com";
const postsEl = document.getElementById("posts");
const search = document.getElementById("search");

let allPosts = [];

fetch(`${API}/api/posts`)
  .then(r => r.json())
  .then(data => {
    allPosts = data;
    render(data);
  })
  .catch(() => postsEl.innerHTML = "Failed to load posts");

function render(posts) {
  postsEl.innerHTML = "";
  posts.forEach(p => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body">
        <h3>${p.title}</h3>
        <div class="meta">
          <span>${new Date(p.created_at).toDateString()}</span>
          <span class="views">𓁼 ${views}</span>
        </div>
      </div>
    `;
    card.onclick = () => location.href = `post.html?id=${p.id}`;
    postsEl.appendChild(card);
  });
}

search.oninput = e => {
  const q = e.target.value.toLowerCase();
  render(allPosts.filter(p => p.title.toLowerCase().includes(q)));
};

/* hidden admin */
let taps = 0;
document.getElementById("adminGate").onclick = () => {
  taps++;
  setTimeout(() => taps = 0, 350);
  if (taps === 2) location.href = "admin.html";
};
