import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";  

const firebaseConfig = {
  apiKey: "AIzaSyBAM8h4L9uGpvQuCW47gmrlVX398XIHD8U",
  authDomain: "sip-women-in-stem.firebaseapp.com",
  projectId: "sip-women-in-stem",
  storageBucket: "sip-women-in-stem.appspot.com",
  messagingSenderId: "105998396564",
  appId: "1:105998396564:web:9dfd4496c4df0299519881",
  measurementId: "G-5W8VT93PTM"
};

// ✅ Initialize ONCE (no duplicates, no re-declare)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

console.log("[firebase] apps:", getApps().length, "app name:", app.name);

export const ROUTES = { login: "./login.html", profile: "./profile.html", chat: "./chat.html" };
export function go(url) { window.location.replace(url); }
export function guard(onAuthed, fallback = ROUTES.login) {
  onAuthStateChanged(auth, (user) => (user ? onAuthed(user) : go(fallback)));
}
