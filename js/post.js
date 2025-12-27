import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

// Get slug from URL (e.g. /let-see-what-we-get → "let-see-what-we-get")
const slug = location.pathname.slice(1).trim().toLowerCase();

let postId = null; // Set after post loads

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html' class='home'>← Home</a>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      postId = post.id;

      // innerHTML structure
      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Style images in content
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "88%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "24px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button - copy current URL
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied to clipboard! 📋"))
          .catch(() => prompt("Copy this link manually:", location.href));
      });

      // Update SEO & social meta tags dynamically
      document.title = `${post.title.trim()} - Group4 Blog`;

      document.getElementById("canonical").href = location.href;

      const cleanText = post.content.replace(/<[^>]*>/g, '').trim();
      const description = cleanText.slice(0, 160) + (cleanText.length > 160 ? '...' : '');

      document.getElementById("metaDescription").content = description;
      document.getElementById("ogTitle").content = post.title.trim();
      document.getElementById("ogDesc").content = description;
      document.getElementById("ogUrl").content = location.href;
      document.getElementById("twitterTitle").content = post.title.trim();
      document.getElementById("twitterDesc").content = description;

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title.trim(),
        "datePublished": post.created_at,
        "dateModified": post.created_at,
        "author": { "@type": "Person", "name": "StatusCode:404" },
        "publisher": {
          "@type": "Organization",
          "name": "Group4 Blog",
          "logo": { "@type": "ImageObject", "url": "https://group4-dun.vercel.app/images/icon.png" }
        },
        "image": "https://group4-dun.vercel.app/images/icon.png",
        "description": description,
        "url": location.href
      };

      let script = document.getElementById("structuredData");
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "structuredData";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);

      // Load comments
      loadComments(postId);
    })
    .catch(err => {
      console.error("Post load error:", err);
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Home</a>";
    });
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to load comments");

    const comments = await res.json();

    commentListEl.innerHTML = comments.length === 0
      ? "<p class='muted'>No comments yet. Be the first!</p>"
      : "";

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>${c.name}</strong>
        <p>${c.content}</p>
      `;
      commentListEl.appendChild(div);
    });
  } catch (err) {
    console.error("Load comments error:", err);
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit new comment - POST to correct endpoint
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Please fill name and comment");
    return;
  }

  if (!postId) {
    alert("Post not loaded — reload the page");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/comments`, { // <-- POST to /api/comments
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, name, content }) // <-- include postId
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("POST error:", res.status, errorText);
      throw new Error(`Failed: ${res.status} - ${errorText}`);
    }

    nameInput.value = "";
    contentInput.value = "";
    loadComments(postId);
    alert("Comment posted successfully!");
  } catch (err) {
    console.error("Comment submit error:", err);
    alert("Failed to post comment — try again");
  }
});  toggleBtn.textContent = commentsContainer.classList.contains("hidden")
    ? "Show Comments ·͟͟͟͞͞➳"
    : "Hide Comments ⤴";
});

// -----------------------
// Load post
// -----------------------
if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2>";
} else {
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.slug.toLowerCase() === slug);
      if (!post) throw new Error("Post not found");

      postId = post.id;

      postContentEl.innerHTML = `
        <p class="muted date">${new Date(post.created_at).toDateString()}</p>
        <h1>${escapeHTML(post.title)}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied!"))
          .catch(() => prompt("Copy manually:", location.href));
      });

      loadComments(postId);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2>";
    });
}

// -----------------------
// Load comments
// -----------------------
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed");

    const comments = await res.json();
    commentListEl.innerHTML = "";

    if (comments.length === 0) {
      commentListEl.innerHTML = "<p class='muted'>No comments yet.</p>";
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";

      div.innerHTML = `
        <div class="comment-header">
          <strong>${escapeHTML(c.name)}</strong>
          <span class="comment-time">${formatDate(c.created_at)}</span>
        </div>
        <p>${escapeHTML(c.content)}</p>
      `;

      commentListEl.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    commentListEl.innerHTML =
      "<p class='muted'>Failed to load comments</p>";
  }
}

// -----------------------
// Submit comment (optimistic)
// -----------------------
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Fill name and comment");
    return;
  }

  if (!postId) {
    alert("Post not loaded");
    return;
  }

  // Optimistic UI
  const tempDiv = document.createElement("div");
  tempDiv.className = "comment optimistic";
  tempDiv.innerHTML = `
    <div class="comment-header">
      <strong>${escapeHTML(name)}</strong>
      <span class="comment-time">Posting…</span>
    </div>
    <p>${escapeHTML(content)}</p>
  `;
  commentListEl.prepend(tempDiv);

  nameInput.value = "";
  contentInput.value = "";

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content })
    });

    if (!res.ok) throw new Error("Failed");

    tempDiv.remove();
    loadComments(postId);
  } catch (err) {
    console.error(err);
    tempDiv.remove();
    alert("Failed to post comment");
  }
});
