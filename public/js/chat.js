import { requireAuth, usernameFor } from "./auth.js";
import { db } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const messagesContainer = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");


// requireAuth should call the callback with a signed-in user
requireAuth((user) => {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc")); // <-- field matches write below

  onSnapshot(q, (snap) => {
    messagesContainer.innerHTML = "";
    snap.forEach((doc) => renderMessage(doc.data()));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  messageForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    try {
      await addDoc(messagesRef, {
        text,
        uid: user.uid,
        username: usernameFor(user),
        timestamp: serverTimestamp() // <-- same field as in orderBy
      });
      messageInput.value = "";
    } catch (err) {
      alert("Send failed: " + (err?.message || err));
    }
  });
});

function renderMessage(data) {
  const div = document.createElement("div");
  div.className = "chat-bubble";
  const time = data.timestamp?.toDate?.()?.toLocaleString?.() || "";
  div.innerHTML = `
    <div class="chat-meta">
      <span class="chat-username">${esc(data.username || "anon")}</span>
      <span class="chat-time">${esc(time)}</span>
    </div>
    <div class="chat-text">${esc(data.text || "")}</div>`;
  messagesContainer.appendChild(div);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
