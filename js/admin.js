const API = "https://backend-x16b.onrender.com";

const loginBtn = document.getElementById("loginBtn");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Fill all fields");
    return;
  }

  loginBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // IMPORTANT: token key MUST match backend
    localStorage.setItem("token", data.token);

    loginBox.hidden = true;
    dashboard.hidden = false;

  } catch (err) {
    alert(err.message);
  } finally {
    loginBtn.textContent = "Login";
  }
});
