// /public/js/auth.js
import { auth, db, go, ROUTES } from "./firebase.js";
import { 
  onAuthStateChanged, setPersistence, browserLocalPersistence, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function onAuthChanged(handler){
  return onAuthStateChanged(auth, handler);
}

export async function login(email, password){
  await setPersistence(auth, browserLocalPersistence);
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signup(email, password, username){
  await setPersistence(auth, browserLocalPersistence);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // set displayName
  try { await updateProfile(cred.user, { displayName: username }); } catch {}
  // create user doc
  try {
    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch(e){ console.warn("user doc create failed", e); }
  return cred;
}

export async function logout(){
  await signOut(auth);
  go(ROUTES.login);
}

export function requireAuth(onAuthed, fallback=ROUTES.login){
  onAuthStateChanged(auth, (user)=> user ? onAuthed(user) : go(fallback));
}

export function usernameFor(user){
  return user?.displayName || (user?.email ? user.email.split("@")[0] : "anon");
}
