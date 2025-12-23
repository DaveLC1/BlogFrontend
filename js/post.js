import { API_BASE } from "./config.js";

const postContentEl = document.getElementById("post-content");
const commentListEl = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const nameInput = document.getElementById("name");
const contentInput = document.getElementById("content");

// Get slug from current URL: /testing-phase → "testing-phase"
const slug = location.pathname.slice(1).trim().toLowerCase();

if (!slug) {
  postContentEl.innerHTML = "<h2>No post selected</h2><a href='index.html' class='home'>← Back to Home</a>";
} else {
  // Fetch all posts and find the one matching the slug
  fetch(`${API_BASE}/api/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      // Case-insensitive match for safety
      const post = posts.find(p => p.slug.toLowerCase() === slug);

      if (!post) {
        throw new Error("Post not found by slug");
      }

      // Render post title, date, full content, and share button
      postContentEl.innerHTML = `
        <h1>${post.title.trim()}</h1>
        <p class="muted">${new Date(post.created_at).toDateString()}</p>
        <div class="post-body">${post.content}</div>
        <button id="shareBtn">Share Post</button>
      `;

      // Style all images in content beautifully
      postContentEl.querySelectorAll("img").forEach(img => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "20px auto";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      });

      // Share button - copies clean slug URL to clipboard
      document.getElementById("shareBtn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(location.href)
          .then(() => {
            alert("Post link copied to clipboard! 📋");
          })
          .catch(() => {
            // Fallback for older browsers
            prompt("Copy this link manually:", location.href);
          });
      });

      // Load comments using post ID
      loadComments(post.id);
    })
    .catch(err => {
      console.error(err);
      postContentEl.innerHTML = "<h2>Post not found</h2><a href='index.html' class='home'>← Back to Home</a>";
    });
}

// Load and display comments with admin reply UI
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    if (!res.ok) throw new Error();
    const comments = await res.json();

    commentListEl.innerHTML = comments.length === 0 
      ? "<p class='muted'>No comments yet. Be the first!</p>" 
      : "";

    comments.forEach(comment => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.innerHTML = `
        <strong>${comment.name}</strong>
        <p>${comment.content}</p>
        <button class="reply-btn muted">Reply (Admin)</button>
        <form class="reply-form" hidden>
          <textarea placeholder="Write your reply as admin..." required></textarea>
          <button type="submit">Send Reply</button>
        </form>
        <div class="replies"></div>
      `;

      // Toggle reply form
      const replyBtn = commentDiv.querySelector(".reply-btn");
      const replyForm = commentDiv.querySelector(".reply-form");

      replyBtn.onclick = () => {
        replyForm.hidden = !replyForm.hidden;
      };

      // Handle reply submit (UI only for now)
      replyForm.onsubmit = (e) => {
        e.preventDefault();
        const replyText = replyForm.querySelector("textarea").value.trim();
        if (replyText) {
          const replyDiv = document.createElement("div");
          replyDiv.className = "comment reply-comment";
          replyDiv.innerHTML = `<strong>Admin Reply:</strong> <p>${replyText}</p>`;
          commentDiv.querySelector(".replies").appendChild(replyDiv);
          replyForm.reset();
          replyForm.hidden = true;
        }
      };

      commentListEl.appendChild(commentDiv);
    });
  } catch (err) {
    commentListEl.innerHTML = "<p class='muted'>Failed to load comments</p>";
  }
}

// Submit new comment (placeholder - extend with backend when ready)
commentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name || !content) {
    alert("Name and comment are required");
    return;
  }

  alert("Comment submitted successfully! 🎉");

  nameInput.value = "";
  contentInput.value = "";
});
