// --- Firebase imports ---
import { app, db } from "./firebase.js";
import {
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

console.log("map.js loaded");

// --- Leaflet map setup ---
if (window._leafletMap) {
  window._leafletMap.invalidateSize();
} else {
  const el = document.getElementById("map");
  if (el && el._leaflet_id) {
    try {
      el._leaflet_id = null;
      el.replaceWith(el.cloneNode(true));
    } catch {}
  }

  // ✅ Lock the map to a single world and prevent over-zooming out
  const WORLD_BOUNDS = L.latLngBounds([[-85, -180], [85, 180]]);

  const map = L.map("map", {
    worldCopyJump: false,
    maxBounds: WORLD_BOUNDS,     // limit panning to one world
    maxBoundsViscosity: 1.0      // strong "rubber band" at edges
  });

  // Non-wrapping tiles (stop duplicate worlds)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    noWrap: true,
    bounds: WORLD_BOUNDS
  }).addTo(map);

  // Show exactly one world initially
  map.fitBounds(WORLD_BOUNDS, { animate: false });

  // Hard-cap zoom OUT to "one world", but allow zooming IN
  const minZ = map.getBoundsZoom(WORLD_BOUNDS, true);
  map.setMinZoom(minZ);
  map.setMaxZoom(18);

  // Keep the cap correct on window resize
  window.addEventListener("resize", () => {
    const z = map.getBoundsZoom(WORLD_BOUNDS, true);
    map.setMinZoom(z);
    if (map.getZoom() < z) map.setZoom(z);
  });

  // custom heart pin
  const heartIcon = L.icon({
    iconUrl: "./images/heart-pin.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36]
  });

  const pinsLayer = L.layerGroup().addTo(map);

  // --- Firestore live data ---
  const colRef = collection(db, "stories");

    onSnapshot(colRef, (snap) => {
        pinsLayer.clearLayers();
        let count = 0;

        snap.forEach((doc) => {
          const d = doc.data();

          const lat = parseFloat(
          d.lat ?? d.latitude ?? d.Latitude ?? d.location?.lat ?? d.coords?.lat
        );

        const lng = parseFloat(
          d.lng ?? d.lon ?? d.longitude ?? d.Longitude ?? d.location?.lng ?? d.coords?.lng ?? d.lang
        );

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return; // skip if no usable coords

        count++;

        //all popup related variables
        const name = d.name;
        const background = d.background ?? "";
        const stemField = d.stemField ?? "";
        const accomplishments = d.accomplishments ?? "";
        const whyYouMatter = d.whyYouMatter ?? "";
        const city = d.city ?? "";

        const popupHtml = `
        <div class="story-popup">
          <strong>${name}</strong>
          ${background ? `<br><strong>Background:</strong> ${background}` : ""}
          ${stemField ? `<br><strong>STEM Field:</strong> ${stemField}` : ""}
          ${accomplishments ? `<br><strong>Accomplishments:</strong> ${accomplishments}` : ""}
          ${whyYouMatter ? `<br><strong>Why You Matter:</strong> ${background}` : ""}
          ${city ? `<br><strong>City:</strong> ${city}` : ""}
        </div>
        `;

      L.marker([lat, lng], { icon: heartIcon })
        .addTo(pinsLayer)
        .bindPopup(popupHtml);
    });

    console.log("pins count:", count);
  },
  (err) => console.error("stories onSnapshot error:", err)
);

  window._leafletMap = map;
}
