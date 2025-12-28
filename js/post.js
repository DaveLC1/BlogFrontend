import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

/* ================= SLUG FIX (IMPORTANT) ================= */
// Works for:
// /my-post
// /my-post/
// /my-post/index.html
let slug = location.pathname
  .replace(/\/$/, "")
  .split("/")
  .pop()
  .replace(".html", "")
  .toLowerCase();

let postId = null;
let lastCommentTime = 0;

/* ================= LOAD POST ================= */

if (!slug) {
  postContentEl.innerHTML =
    "<h2>No post selected</h2><a href='/' class='home'>← Home</a>";
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
        <h1>${post.title.trim()}</h1>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      /* Image styling */
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "88%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "24px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => alert("Link copied! 📋"))
          .catch(() => prompt("Copy manually:", location.href));
      });

      /* SEO */
      document.title = `${post.title.trim()} - Group4 Blog`;
      document.getElementById("canonical").href = location.href;

      const cleanText = post.content.replace(/<[^>]*>/g, "").trim();
      const description =
        cleanText.slice(0, 160) + (cleanText.length > 160 ? "..." : "");

      document.getElementById("metaDescription").content = description;
      document.getElementById("ogTitle").content = post.title.trim();
      document.getElementById("ogDesc").content = description;
      document.getElementById("ogUrl").content = location.href;
      document.getElementById("twitterTitle").content = post.title.trim();
      document.getElementById("twitterDesc").content = description;

      /* Structured data */
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title.trim(),
        datePublished: post.created_at,
        dateModified: post.created_at,
        author: { "@type": "Person", name: "StatusCode:404" },
        publisher: {
          "@type": "Organization",
          name: "Group4 Blog",
          logo: {
            "@type": "ImageObject",
            url: "https://group4-dun.vercel.app/images/icon.png"
          }
        },
        image: "https://group4-dun.vercel.app/images/icon.png",
        description,
        url: location.href
      };

      let script = document.getElementById("structuredData");
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "structuredData";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);

      loadComments();
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML =
        "<h2>Post not found</h2><a href='/' class='home'>← Home</a>";
    });
}

/* ================= COMMENTS ================= */

async function loadComments() {
  if (!postId) return;

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error("Failed to load comments");

    const comments = await res.json();
    commentListEl.innerHTML = "";

    if (comments.length === 0) {
      commentListEl.innerHTML =
        "<p class='muted'>No comments yet.</p>";
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <div class="comment-header">
          <strong>${c.name}</strong>
          <span class="comment-time">${formatTime(c.created_at)}</span>
        </div>
        <p>${c.content}</p>
      `;
      commentListEl.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    commentListEl.innerHTML =
      "<p class='muted'>Failed to load comments</p>";
  }
}

function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ================= SUBMIT COMMENT ================= */

commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) return alert("Fill name and comment");

  const now = Date.now();
  if (now - lastCommentTime < 30000)
    return alert("Wait 30s before posting again");

  lastCommentTime = now;

  try {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, name, content })
    });

    if (!res.ok) throw new Error("Failed");

    nameInput.value = "";
    contentInput.value = "";
    loadComments();
  } catch (err) {
    alert("Failed to post comment");
  }
});
