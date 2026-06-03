// public/js/timeline.js
import { app, db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("timeline.js loaded. project:", app?.options?.projectId);

  const host = document.getElementById("timeline-container");
  if (!host) { console.error("Missing #timeline-container"); return; }

  host.innerHTML = `<div id="timeline-strip" class="timeline" role="list"></div>`;
  const strip = document.getElementById("timeline-strip");

  const ref = collection(db, "timeline");

  onSnapshot(ref, (snap) => {
    const items = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const start = pickStart(d);
      const end   = pickEnd(d);
      const label = d.displayYear
        ? String(d.displayYear)
        : (start != null && end != null ? `${fmtYear(start)}–${fmtYear(end)}`
           : start != null ? fmtYear(start)
           : "");

      items.push({
        start,
        end,
        name: d.name ?? d.title ?? d.person ?? "Untitled",
        summary: d.summary ?? d.description ?? d.body ?? d.bio ?? d.blurb ?? "",
        img: d.image ?? d.imageUrl ?? d.photo ?? null,
        label
      });
    });

    // strict chronological: oldest -> newest; unknowns last
    items.sort((a, b) => (a.start ?? 9_999_999) - (b.start ?? 9_999_999));

    strip.innerHTML = items.map(cardHtml).join("");
    // Uncomment to debug ordering:
    // console.table(items.map(i => ({ name: i.name, start: i.start, end: i.end, label: i.label })));
  }, (err) => {
    console.error("Firestore timeline error:", err);
    strip.innerHTML = `<p>Couldn't load timeline.</p>`;
  });

  function cardHtml(it) {
    const heading = it.label ? `${it.label} — ${it.name}` :
                    it.start != null ? `${fmtYear(it.start)} — ${it.name}` : it.name;

    return `
      <article class="timeline-entry" role="listitem">
        <div class="content">
          ${it.img ? `<img src="${esc(it.img)}" alt="${esc(it.name)}">` : ""}
          <h3>${esc(heading)}</h3>
          ${it.summary ? `<p class="timeline-desc">${esc(it.summary)}</p>` : ""}
        </div>
      </article>
    `;
  }

  // -------- helpers --------
  function pickStart(d) {
    if (Number.isFinite(d?.startYear)) return d.startYear;

    // Parse from displayYear / year-like fields
    const s = firstString(d.displayYear, d.year, d.date, d.born, d.birth, d.lifespan);
    if (!s) return null;

    // BCE/BC -> negative
    const bce = /(\d{1,4})\s*(BCE|BC)/i.exec(s);
    if (bce) return -parseInt(bce[1], 10);

    // range like "360 - 415", "c. 360–415 CE" -> take first number
    const m = s.match(/(\d{1,4})/);
    return m ? parseInt(m[1], 10) : null;
  }

  function pickEnd(d) {
    if (Number.isFinite(d?.endYear)) return d.endYear;
    const s = firstString(d.displayYear, d.lifespan);
    if (!s) return null;

    // find the last number in a range
    const r = s.match(/[-–]\s*(\d{1,4})(\s*(BCE|BC))?/i);
    if (!r) return null;
    const val = parseInt(r[1], 10);
    return r[3] ? -val : val;
  }

  function firstString(...vals) {
    for (const v of vals) if (v != null) return String(v);
    return null;
  }

  function fmtYear(y) {
    return y < 0 ? `${Math.abs(y)} BCE` : `${y}`;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c])
    );
  }
});
