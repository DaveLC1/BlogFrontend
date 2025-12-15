import { API_BASE } from "./config.js";

login.onclick = async () => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: u.value, password: p.value })
  });

  const data = await res.json();
  localStorage.token = data.token;
  location.href = "admin-dashboard.html";
};