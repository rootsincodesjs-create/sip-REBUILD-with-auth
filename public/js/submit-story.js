// public/js/submit-story.js
import { db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("story-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Grab fields
    const name           = document.getElementById("name")?.value.trim() || "";
    const background     = document.getElementById("background")?.value.trim() || "";
    const accomplishments= document.getElementById("accomplishments")?.value.trim() || "";
    const why            = document.getElementById("y-u-matter")?.value.trim() || "";
    const cityInput      = document.getElementById("city")?.value.trim() || "";
    const file           = document.getElementById("image")?.files?.[0] ?? null;

    // Minimal validation (tweak as you like)
    if (!name)        return alert("Please enter your name.");
    if (!background)  return alert("Please tell us a bit about your background.");
    if (!cityInput)   return alert("Please enter a city.");

    // Disable the button while we work
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled", "true");

    try {
      // 1) Geocode the city (Nominatim)
      const geo = await geocodeCity(cityInput);
      if (!geo) {
        alert("City not found. Try a different search.");
        return;
      }

      // 2) Optional image upload
      let imageUrl = "";
      if (file) {
        try {
          const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Image upload failed. Saving without the image.");
        }
      }

      // 3) Save to Firestore
      const docData = {
        name,
        background,
        accomplishments,
        why,                          // keep your original key
        city: geo.displayName,        // nice, human-readable name
        lat: Number(geo.lat),
        lon: Number(geo.lon),
        imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "stories"), docData);

      alert("✅ Story submitted!");
      form.reset();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed: " + (err?.message || err));
    } finally {
      submitBtn?.removeAttribute("disabled");
    }
  });
});

/** Small helper to geocode with Nominatim */
async function geocodeCity(query) {
  try {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?format=json&limit=1&addressdetails=0&accept-language=en&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        // polite identification helps Nominatim; replace with your email if you want
        "Accept": "application/json",
      },
    });
    if (!res.ok) return null;
    const arr = await res.json();
    if (!arr?.length) return null;

    const hit = arr[0];
    return {
      displayName: hit.display_name,
      lat: hit.lat,
      lon: hit.lon,
    };
  } catch {
    return null;
  }
}
