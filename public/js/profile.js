// ============================================================
// IMPORTS
// ============================================================
import { app, db } from "./firebase.js";
import { requireAuth, logout, usernameFor } from "./auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ============================================================
// DOM REFERENCES
// ============================================================
const gate = document.getElementById("gate");
const appEl = document.getElementById("app");
const who = document.getElementById("who");
const emailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout");

const displayNameInput = document.getElementById("display-name");
const bioTextarea = document.getElementById("bio");
const themeSelect = document.getElementById("profile-theme");
const customColorPicker = document.getElementById("custom-color");
const saveBtn = document.getElementById("save-profile");

// ============================================================
// THEME ENGINE – COMPLETE THEME DEFINITIONS
// ============================================================
function applyTheme(theme, customColor = null) {
  const themes = {
    pink: {
      "--primary": "#ff69b4",
      "--bg-body": "#fff0f5",
      "--text-primary": "#333333",
      "--btn-primary-bg": "#ff85b3",
      "--primary-dark": "#61203E",
      "--primary-mid": "#AD6476",
      "--bg-card": "#ffffff",
      "--bg-input": "#fff0f5",
      "--border-color": "#ffb6c1",
      "--shadow-card": "0 12px 32px rgba(255,182,193,.28)",
    },
    blue: {
      "--primary": "#4a90e2",
      "--bg-body": "#f0f8ff",
      "--text-primary": "#222222",
      "--btn-primary-bg": "#4a90e2",
      "--primary-dark": "#2c5f8a",
      "--primary-mid": "#6a9ec9",
      "--bg-card": "#ffffff",
      "--bg-input": "#f0f8ff",
      "--border-color": "#a0c4e8",
      "--shadow-card": "0 12px 32px rgba(74,144,226,.28)",
    },
    dark: {
      "--primary": "#bb86fc",
      "--bg-body": "#121212",
      "--text-primary": "#e0e0e0",
      "--btn-primary-bg": "#bb86fc",
      "--primary-dark": "#9a6ad8",
      "--primary-mid": "#a87ad9",
      "--bg-card": "#1e1e1e",
      "--bg-input": "#2a2a2a",
      "--border-color": "#444444",
      "--shadow-card": "0 12px 32px rgba(0,0,0,.5)",
    },
  };

  const vars = themes[theme];
  if (vars) {
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }
  // If custom, override the primary colour
  if (customColor) {
    document.documentElement.style.setProperty("--primary", customColor);
  }
}

// ============================================================
// MAIN – on DOM ready
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  requireAuth(async (user) => {
    // Show app, hide loader
    gate.hidden = true;
    appEl.hidden = false;

    // Basic user info
    const displayName = user.displayName || usernameFor(user) || "friend";
    who.textContent = displayName;
    emailEl.textContent = user.email || "(no email)";

    // ------------------------------------------------------------------
    // 1. LOAD SAVED PROFILE FROM FIRESTORE
    // ------------------------------------------------------------------
    const userDocRef = doc(db, "users", user.uid);
    let savedData = {};

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        savedData = docSnap.data();
        // Populate fields
        displayNameInput.value = savedData.displayName || displayName;
        bioTextarea.value = savedData.bio || "";
        themeSelect.value = savedData.theme || "pink";

        // Handle custom colour
        if (savedData.theme === "custom" && savedData.customColor) {
          customColorPicker.value = savedData.customColor;
          customColorPicker.style.display = "inline";
          applyTheme("custom", savedData.customColor);
        } else {
          applyTheme(savedData.theme || "pink");
        }
      } else {
        // No saved profile yet – use default theme
        applyTheme("pink");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      // Fallback: apply default theme
      applyTheme("pink");
    }

    // ------------------------------------------------------------------
    // 2. EVENT: Toggle custom color picker
    // ------------------------------------------------------------------
    themeSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "custom") {
        customColorPicker.style.display = "inline";
      } else {
        customColorPicker.style.display = "none";
        applyTheme(val); // preview the selected theme immediately
      }
    });

    // ------------------------------------------------------------------
    // 3. EVENT: Save Profile
    // ------------------------------------------------------------------
    saveBtn.addEventListener("click", async () => {
      try {
        const newDisplayName = displayNameInput.value.trim() || "Anonymous";
        const bio = bioTextarea.value.trim();
        let theme = themeSelect.value;
        let customColor = null;

        if (theme === "custom") {
          customColor = customColorPicker.value;
        }

        // Save to Firestore
        await setDoc(
          userDocRef,
          {
            displayName: newDisplayName,
            bio,
            theme,
            customColor,
            email: user.email,
          },
          { merge: true }
        );

        // Update Firebase Auth display name
        await updateProfile(user, { displayName: newDisplayName });

        // Apply theme immediately
        applyTheme(theme, customColor);
        // Store in localStorage for persistence across pages
        localStorage.setItem("theme", theme);
        if (customColor) localStorage.setItem("customColor", customColor);

        // Update displayed name
        who.textContent = newDisplayName;

        alert("✅ Profile saved successfully!");
      } catch (err) {
        console.error("Save error:", err);
        alert("❌ Failed to save profile. Check console for details.");
      }
    });

    // ------------------------------------------------------------------
    // 4. EVENT: Logout (the existing logout function)
    // ------------------------------------------------------------------
    logoutBtn.addEventListener("click", logout);
  });
});