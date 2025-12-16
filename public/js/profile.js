import { requireAuth, logout, usernameFor } from "./auth.js";
document.addEventListener("DOMContentLoaded", ()=>{
  const gate=document.getElementById("gate");
  const app=document.getElementById("app");
  const who=document.getElementById("who");
  const emailEl=document.getElementById("user-email");
  const logoutBtn=document.getElementById("logout");
  const toChat=document.getElementById("toChat");

  requireAuth((user)=>{
    if(gate) gate.hidden = true;
    if(app) app.hidden = false;
    who.textContent = usernameFor(user);
    emailEl.textContent = user.email || "(no email)";
    logoutBtn?.addEventListener("click", logout);
    toChat?.addEventListener("click", ()=>location.href="./profile.html");
  });
});
