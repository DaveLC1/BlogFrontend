import { API_BASE } from "./config.js";

const postsEl = document.getElementById("posts");
const searchInput = document.getElementById("search");

let allPosts = [];

// Fetch posts
fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data || [];
    renderPosts(allPosts);
    document.querySelector(".loading")?.remove();
  });

// Render posts - newest first
function renderPosts(posts) {
  postsEl.innerHTML = "";

  // Sort newest first
  const sorted = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(post => {
    // Extract first image from content (if any)
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    const firstImg = imgMatch ? imgMatch[1] : null;

    // Text preview (first 150 chars, strip HTML)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content;
    const plainText = tempDiv.textContent || "";
    const previewText = plainText.slice(0, 150) + (plainText.length > 150 ? "..." : "");

    // Read time estimate
    const wordCount = plainText.split(/\s+/).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card compact-card";  // New class for smaller size

    card.innerHTML = `
      <div class="card-preview">
        ${firstImg ? `<img src="${firstImg}" alt="Post image" class="preview-img">` : ''}
        <div class="preview-text">
          <h3>${post.title.trim()}</h3>
          <p class="muted preview-p">${previewText}</p>
          <p class="muted"><small>${new Date(post.created_at).toDateString()} • ${readTime} min read</small></p>
        </div>
      </div>
      <div class="card-footer">
        <span class="views muted"><small>𓁼 ${views} views</small></span>
        <button class="read-more">Read more →</button>
      </div>
    `;

    card.onclick = (e) => {
      if (!e.target.classList.contains("read-more")) {
        location.href = `/${post.slug}`;
      }
    };
    card.querySelector(".read-more")?.addEventListener("click", () => location.href = `/${post.slug}`);

    postsEl.appendChild(card);
  });
}

// Search (same as before)
searchInput?.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});
