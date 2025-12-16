import { signup } from "./auth.js";
import { go } from "./firebase.js";
document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("signup-form");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const username = document.getElementById("username");
  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      await signup(email.value.trim(), password.value, username.value.trim());
      go("./profile.html");
    }catch(err){
      alert("Sign up failed: " + (err?.message || err));
    }
  });
});
