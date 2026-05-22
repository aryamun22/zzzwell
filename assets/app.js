// Shared directory rendering: search, tag filters, map links, add-to-calendar.

function mapsLink(p) {
  const q = encodeURIComponent([p.org, p.city, p.state, p.zip, p.country].filter(Boolean).join(" "));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function calendarLink(p) {
  const title = encodeURIComponent(`Consult: ${p.name}${p.credentials ? ", " + p.credentials : ""}`);
  const where = encodeURIComponent([p.org, p.city, p.state, p.zip].filter(Boolean).join(", "));
  const details = encodeURIComponent(`Cash-pay specialist consult.\n${p.note || ""}\n\n(Demo listing — verify details directly with the provider.)`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${where}&details=${details}`;
}

function badgeFor(p) {
  const map = {
    cash: ["cash", "Cash / OON"],
    cms: ["cms", "CMS data"],
    community: ["community", "Community-known"],
    getexpanded: ["community", "getExpanded"],
    insurance: ["ins", "Insurance"],
  };
  const key = p.badge || p.source;
  const m = map[key];
  return m ? `<span class="badge ${m[0]}">${m[1]}</span>` : "";
}

function cardHTML(p) {
  const loc = [p.city, p.state, p.country && p.country !== "US" ? p.country : null].filter(Boolean).join(", ");
  const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
  return `
  <article class="card" data-search="${(p.name + " " + (p.org||"") + " " + loc + " " + (p.tags||[]).join(" ")).toLowerCase()}" data-tags="${(p.tags||[]).join("|").toLowerCase()}">
    <div class="top">
      <div>
        <h3>${p.name}</h3>
        ${p.credentials ? `<div class="creds">${p.credentials}</div>` : ""}
      </div>
      <div class="badges">${p.featured ? '<span class="badge goat">⭐ GOAT</span>' : ''}${badgeFor(p)}</div>
    </div>
    ${p.org ? `<div class="org">${p.org}</div>` : ""}
    <div class="loc">📍 ${loc}${p.zip ? " · " + p.zip : ""}</div>
    ${p.payment ? `<div class="payment">💵 ${p.payment}</div>` : ""}
    ${tags ? `<div class="tags">${tags}</div>` : ""}
    ${p.note ? `<div class="note">${p.note}</div>` : ""}
    <div class="actions">
      <a href="${mapsLink(p)}" target="_blank" rel="noopener">🗺️ Map</a>
      <a href="${calendarLink(p)}" target="_blank" rel="noopener">📅 Add to Calendar</a>
    </div>
  </article>`;
}

function collectTags(list) {
  const counts = {};
  list.forEach(p => (p.tags || []).forEach(t => counts[t] = (counts[t] || 0) + 1));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
}

async function renderDirectory({ dataUrl, mount, transform }) {
  const el = document.querySelector(mount);
  let raw;
  try {
    const res = await fetch(dataUrl);
    raw = await res.json();
  } catch (e) {
    el.innerHTML = `<div class="empty">Could not load data. Serve this folder over http (e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</div>`;
    return;
  }
  const list = transform ? transform(raw) : raw;

  const tags = collectTags(list).slice(0, 12);
  el.innerHTML = `
    <div class="toolbar">
      <label class="search">🔎 <input type="text" id="q" placeholder="Search by name, city, specialty…"></label>
      <span class="count" id="count"></span>
    </div>
    <div class="filters" id="filters">
      <button class="chip active" data-tag="">All</button>
      ${tags.map(t => `<button class="chip" data-tag="${t.toLowerCase()}">${t}</button>`).join("")}
    </div>
    <div class="grid" id="grid">${list.map(cardHTML).join("")}</div>
  `;

  const grid = el.querySelector("#grid");
  const q = el.querySelector("#q");
  const count = el.querySelector("#count");
  let activeTag = "";

  function apply() {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    grid.querySelectorAll(".card").forEach(c => {
      const matchTerm = !term || c.dataset.search.includes(term);
      const matchTag = !activeTag || c.dataset.tags.includes(activeTag);
      const show = matchTerm && matchTag;
      c.style.display = show ? "" : "none";
      if (show) shown++;
    });
    count.textContent = `${shown} provider${shown === 1 ? "" : "s"}`;
    if (!shown && !grid.querySelector(".empty")) {
      grid.insertAdjacentHTML("beforeend", `<div class="empty">No matches. Try a broader search.</div>`);
    }
    const emptyEl = grid.querySelector(".empty");
    if (emptyEl) emptyEl.style.display = shown ? "none" : "";
  }

  q.addEventListener("input", apply);
  el.querySelector("#filters").addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    el.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    activeTag = btn.dataset.tag;
    apply();
  });
  apply();
}
