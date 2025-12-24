// Fetch and render - loading disappears only after successful render
fetch(`${API_BASE}/api/posts`)
  .then(res => res.json())
  .then(data => {
    allPosts = data || [];
    renderPosts(allPosts);
    // Remove loading only after render
    document.querySelector(".loading")?.remove();
  })
  .catch(err => {
    console.error(err);
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--danger);">Failed to load posts</div>';
    document.querySelector(".loading")?.remove();
  })
  .finally(() => {
    // Safety: always remove loading even if something breaks
    document.querySelector(".loading")?.remove();
  });

function renderPosts(posts) {
  postsEl.innerHTML = ""; // Clear loading + old content

  if (posts.length === 0) {
    postsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.7;">No posts yet</div>';
    return;
  }

  // Your card render here (with preview, image left, title right, text below, views bottom right)
  posts.forEach(post => {
    // Extract first image from content (if any)
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    const firstImg = imgMatch ? imgMatch[1] : null;

    // Text preview (first 100 chars, strip HTML)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content;
    const plainText = tempDiv.textContent || "";
    const previewText = plainText.slice(0, 100) + (plainText.length > 100 ? "..." : "");

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-preview">
        ${firstImg ? `<img src="${firstImg}" alt="Post image" class="preview-img">` : ''}
        <div class="preview-text">
          <h3>${post.title.trim()}</h3>
          <p class="preview-content">${previewText}</p>
        </div>
      </div>
      <div class="card-meta">
        <span class="date muted">${new Date(post.created_at).toDateString()}</span>
        <span class="views muted bottom-right">𓁼 ${Math.floor(Math.random() * 30 + 5)}M+ views</span>
      </div>
    `;

    card.onclick = () => location.href = `/${post.slug}`;

    postsEl.appendChild(card);
  });
}      No posts yet
    </div>`;
    return;
  }

  const sorted = [...posts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  sorted.forEach(post => {
    const temp = document.createElement("div");
    temp.innerHTML = post.content;

    const img = temp.querySelector("img");
    const text = temp.textContent.replace(/\s+/g, " ").trim().slice(0, 90) + "...";

    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${img ? `<img class="thumb" src="${img.src}">` : ""}
      <div class="card-content">
        <h3>${post.title.trim()}</h3>
        <p class="card-preview">${text}</p>
        <div class="card-footer">${views} views</div>
      </div>
    `;

    card.onclick = () => location.href = `/${post.slug}`;
    postsEl.appendChild(card);
  });
}

/* ================= SEARCH ================= */
searchInput?.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderPosts(
    allPosts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    )
  );
});    return;
  }

  // Sort newest on top
  const sorted = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(post => {
    const views = Math.floor(Math.random() * 30 + 5) + "M+";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${post.title.trim()}</h3>
      <p class="muted">
        ${new Date(post.created_at).toDateString()} 𓁼 ${views} views
      </p>
    `;

    // Click anywhere on card goes to clean slug URL
    card.onclick = () => {
      location.href = `/${post.slug}`;
    };

    postsEl.appendChild(card);
  });
}

// Search functionality
searchInput?.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
});
