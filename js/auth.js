import { API_BASE } from "./config.js";

login.onsubmit=async e=>{
  e.preventDefault();
  const r=await fetch(`${API_BASE}/api/auth/login`,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:u.value,password:p.value})
  });
  const d=await r.json();
  if(d.token){
    localStorage.setItem("token",d.token);
    location.href="dashboard.html";
  } else alert("Invalid");
};
