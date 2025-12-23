comments.forEach(c => {
  const div = document.createElement("div");
  div.className = "comment";
  div.innerHTML = `
    <strong>${c.name}</strong>
    <p>${c.content}</p>
    <button class="reply-btn muted">Reply</button>
    <form class="reply-form" hidden>
      <textarea placeholder="Write reply..." required></textarea>
      <button type="submit">Send Reply</button>
    </form>
    <div class="replies"></div>
  `;
  // Reply toggle (admin only - you can add token check later)
  div.querySelector(".reply-btn").onclick = () => {
    div.querySelector(".reply-form").hidden = !div.querySelector(".reply-form").hidden;
  };
  commentListEl.appendChild(div);
});
