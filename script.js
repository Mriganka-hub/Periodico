// Category names and colors
const CATS = {
  alkali:     ["Alkali metal",          "#e5484d"],
  alkaline:   ["Alkaline earth",        "#f08c00"],
  transition: ["Transition metal",      "#3b82f6"],
  post:       ["Post-transition metal", "#14a3a3"],
  metalloid:  ["Metalloid",             "#8b5cf6"],
  nonmetal:   ["Nonmetal",              "#2fa84f"],
  halogen:    ["Halogen",               "#d6409f"],
  noble:      ["Noble gas",             "#0ea5e9"],
  lanth:      ["Lanthanide",            "#b8860b"],
  actin:      ["Actinide",              "#a1583a"]
};

const grid   = document.getElementById("grid");
const info   = document.getElementById("info");
const q      = document.getElementById("q");
const legend = document.getElementById("legend");

let elements = [];
let cells = [];
let activeCat = null;
let selected = null;

// Load data, then build the page
fetch("elements.json")
  .then(r => r.json())
  .then(data => {
    elements = data;
    buildGrid();
    buildLegend();
    showDetails(elements[25]); // start with Iron
  })
  .catch(err => {
    info.textContent = "Could not load elements.json. Run this page from a local server (see instructions).";
    console.error(err);
  });

function buildGrid() {
  cells = elements.map(e => {
    const b = document.createElement("button");
    b.className = "el";
    b.style.gridRow = e.row;
    b.style.gridColumn = e.col;
    b.style.setProperty("--c", CATS[e.category][1]);
    b.innerHTML = `<small>${e.number}</small><b>${e.symbol}</b><span>${e.name}</span>`;
    b.setAttribute("aria-label", `${e.name}, atomic number ${e.number}`);
    b.addEventListener("click", () => showDetails(e));
    b.addEventListener("mouseenter", () => { if (!selected) showDetails(e, true); });
    grid.appendChild(b);
    return b;
  });

  // Placeholders pointing to the f-block rows
  [["57–71", 6], ["89–103", 7]].forEach(([text, row]) => {
    const d = document.createElement("div");
    d.className = "ph";
    d.textContent = text;
    d.style.gridRow = row;
    d.style.gridColumn = 3;
    grid.appendChild(d);
  });
}

function buildLegend() {
  Object.entries(CATS).forEach(([key, [name, color]]) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.innerHTML = `<i style="background:${color}"></i>${name}`;
    b.addEventListener("click", () => {
      activeCat = activeCat === key ? null : key;
      [...legend.children].forEach(c => c.classList.remove("on"));
      if (activeCat) b.classList.add("on");
      applyFilters();
    });
    legend.appendChild(b);
  });
}

function showDetails(e, hoverOnly = false) {
  if (!hoverOnly) {
    selected = e;
    cells.forEach((c, i) => c.classList.toggle("sel", i === e.number - 1));
  }
  info.innerHTML = `
    <div id="big" style="--c:${CATS[e.category][1]}">
      <small>${e.number}</small><b>${e.symbol}</b><small>${e.mass}</small>
    </div>
    <div>
      <h2>${e.name}</h2>
      <dl>
        <dt>Atomic number</dt><dd>${e.number}</dd>
        <dt>Atomic mass</dt><dd>${e.mass} u</dd>
        <dt>Category</dt><dd>${CATS[e.category][0]}</dd>
        <dt>Group / Period</dt><dd>${e.group ?? "—"} / ${e.period}</dd>
        <dt>State at room temp.</dt><dd>${e.state}</dd>
      </dl>
    </div>`;
}

function applyFilters() {
  const t = q.value.trim().toLowerCase();
  elements.forEach((e, i) => {
    const matchesText = !t ||
      e.name.toLowerCase().includes(t) ||
      e.symbol.toLowerCase() === t ||
      String(e.number) === t;
    const matchesCat = !activeCat || e.category === activeCat;
    cells[i].classList.toggle("dim", !(matchesText && matchesCat));
  });
}

q.addEventListener("input", applyFilters);