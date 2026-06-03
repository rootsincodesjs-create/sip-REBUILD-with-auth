import { login } from "./auth.js";
import { go, auth } from "./firebase.js";
import { sendPasswordResetEmail, getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailEl = document.getElementById("email");
  const passEl  = document.getElementById("password");
  const resetBtn = document.getElementById("reset-password");

  console.log("[login] auth ok?", !!auth, auth?.app?.name);

  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      await login(emailEl.value.trim(), passEl.value);
      const redirect = new URLSearchParams(location.search).get("redirect") || "./profile.html";
      go(redirect);
    }catch(err){
      alert("Login failed: " + (err?.message || err));
    }
  });

  resetBtn?.addEventListener("click", async ()=>{
    const email = emailEl.value.trim();
    if(!email) return alert("Enter your email first.");
    try{
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch(err){ 
      alert("Reset failed: " + (err?.message || err)); }
  });
});
