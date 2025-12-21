const API = "https://backend-x16b.onrender.com";
const postsEl = document.getElementById("posts");
const search = document.getElementById("search");

let allPosts = [];

// Fetch posts
fetch(`${API}/api/posts`)
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
  })
  .then(data => {
    allPosts = data;
    render(allPosts);
    // Remove loading spinner
    const loading = document.querySelector(".loading");
    if (loading) loading.remove();
  })
  .catch(() => {
    postsEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#f85149;">Failed to load posts. Please try again later.</div>';
    document.querySelector(".loading")?.remove();
  });

function render(posts) {
  // Clear previous content
  postsEl.innerHTML = "";

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; opacity:0.7;">No posts available yet.</div>';
    return;
  }

  posts.forEach(p => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${p.title.trim()}</h3>
      <p class="muted">
        ${new Date(p.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    // Click to view full post using id
    card.onclick = () => {
      location.href = `post.html?id=${p.id}`;
    };

    postsEl.appendChild(card);
  });
}

// Search functionality
search.oninput = (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query)
  );
  render(filtered);
};

/* Hidden admin access - double tap the logo */
let taps = 0;
document.getElementById("adminGate").onclick = () => {
  taps++;
  setTimeout(() => taps = 0, 500);
  if (taps >= 2) location.href = "admin.html";
};
