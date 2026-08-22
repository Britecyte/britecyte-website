/**
 * Packed adipocyte field for the hero — CSS-driven SVG, reduced-motion safe.
 */
export function initHeroField() {
  const host = document.querySelector("[data-hero-field]");
  if (!host || host.dataset.ready === "1") return;

  host.dataset.ready = "1";

  const cells = [
    { x: 318, y: 292, rx: 78, ry: 70, rot: -12, n: 0.78 },
    { x: 430, y: 268, rx: 72, ry: 64, rot: 18, n: 0.22 },
    { x: 214, y: 250, rx: 68, ry: 62, rot: 8, n: 0.64 },
    { x: 368, y: 390, rx: 66, ry: 60, rot: -22, n: 0.18 },
    { x: 248, y: 378, rx: 62, ry: 58, rot: 14, n: 0.7 },
    { x: 470, y: 372, rx: 58, ry: 54, rot: -8, n: 0.32 },
    { x: 172, y: 352, rx: 52, ry: 48, rot: 26, n: 0.12 },
    { x: 332, y: 176, rx: 56, ry: 50, rot: -16, n: 0.58 },
    { x: 508, y: 214, rx: 48, ry: 44, rot: 10, n: 0.8 },
    { x: 140, y: 196, rx: 44, ry: 40, rot: -28, n: 0.28 },
    { x: 412, y: 168, rx: 42, ry: 38, rot: 20, n: 0.42 },
    { x: 538, y: 318, rx: 40, ry: 36, rot: -4, n: 0.66 },
    { x: 292, y: 468, rx: 46, ry: 40, rot: 12, n: 0.2 },
    { x: 196, y: 458, rx: 38, ry: 34, rot: -18, n: 0.74 },
    { x: 454, y: 462, rx: 36, ry: 32, rot: 24, n: 0.36 },
  ];

  const markup = cells.map((cell, i) => {
    const nx = cell.x + Math.cos((cell.n * Math.PI * 2) + cell.rot) * (cell.rx * 0.62);
    const ny = cell.y + Math.sin((cell.n * Math.PI * 2) + cell.rot) * (cell.ry * 0.62);
    const hx = cell.x - cell.rx * 0.28;
    const hy = cell.y - cell.ry * 0.32;
    const layer = i > 8 ? "hf-adipo--rear" : "hf-adipo--front";
    return `
      <g class="hf-adipo ${layer} hf-adipo-${(i % 6) + 1}" data-hf-index="${i}">
        <g class="hf-adipo-inner">
          <ellipse class="hf-lipid" cx="${cell.x}" cy="${cell.y}" rx="${cell.rx}" ry="${cell.ry}" transform="rotate(${cell.rot} ${cell.x} ${cell.y})" fill="url(#hf-lipid)" stroke="#d08080" stroke-opacity="0.55" stroke-width="1.35"/>
          <ellipse class="hf-membrane" cx="${cell.x}" cy="${cell.y}" rx="${cell.rx + 1.4}" ry="${cell.ry + 1.4}" transform="rotate(${cell.rot} ${cell.x} ${cell.y})" fill="none" stroke="#c8949a" stroke-opacity="0.28" stroke-width="3.2"/>
          <ellipse class="hf-sheen" cx="${hx}" cy="${hy}" rx="${cell.rx * 0.34}" ry="${cell.ry * 0.22}" transform="rotate(${cell.rot - 18} ${hx} ${hy})" fill="#fffdf6" fill-opacity="0.42"/>
          <circle class="hf-nucleus" cx="${nx}" cy="${ny}" r="${Math.max(3.2, cell.rx * 0.055)}" fill="#7b3f3f" fill-opacity="0.58"/>
        </g>
      </g>
    `;
  }).join("");

  host.innerHTML = `
    <svg class="hero-field-svg" viewBox="0 0 640 640" role="img" aria-label="Animated cluster of adipocytes. Click a cell to wake the tissue.">
      <defs>
        <radialGradient id="hf-lipid" cx="34%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#f5d088"/>
          <stop offset="38%" stop-color="#fde8a8"/>
          <stop offset="56%" stop-color="#ffecc8"/>
          <stop offset="64%" stop-color="#fff0d8"/>
          <stop offset="72%" stop-color="#ffffff"/>
          <stop offset="78%" stop-color="#feeef2"/>
          <stop offset="88%" stop-color="#f8dcc8"/>
          <stop offset="96%" stop-color="#f0c8a0"/>
          <stop offset="100%" stop-color="#eabb90"/>
        </radialGradient>
        <radialGradient id="hf-wash" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stop-color="#fd893c" stop-opacity="0.1"/>
          <stop offset="55%" stop-color="#f5d088" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#233051" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="320" cy="310" r="250" fill="url(#hf-wash)"/>
      <g class="hf-tissue">${markup}</g>
    </svg>
  `;

  bindHeroFieldPlay(host, cells);
}

function bindHeroFieldPlay(host, cells) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const groups = [...host.querySelectorAll(".hf-adipo")];
  const svg = host.querySelector(".hero-field-svg");
  const hero = host.closest(".hero") || host;

  const replay = (el, cls) => {
    if (!el) return;
    el.classList.remove("is-pop", "is-ripple", "is-flash");
    void el.getBoundingClientRect();
    el.classList.add(cls);
    el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
  };

  const poke = (index) => {
    const origin = cells[index];
    const inner = groups[index]?.querySelector(".hf-adipo-inner");
    replay(inner, reduceMotion ? "is-flash" : "is-pop");
    groups[index]?.classList.add("is-awake");
    window.setTimeout(() => groups[index]?.classList.remove("is-awake"), 720);

    if (reduceMotion) return;

    cells.forEach((cell, i) => {
      if (i === index) return;
      const distance = Math.hypot(cell.x - origin.x, cell.y - origin.y);
      if (distance > 168) return;
      const neighbor = groups[i].querySelector(".hf-adipo-inner");
      window.setTimeout(() => replay(neighbor, "is-ripple"), distance * 0.9);
    });
  };

  const pointFromEvent = (event) => {
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(ctm.inverse());
  };

  const nearest = (x, y) => {
    let best = 0;
    let bestD = Infinity;
    cells.forEach((cell, i) => {
      const d = Math.hypot(cell.x - x, cell.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onPlay = (event) => {
    if (event.target.closest("a, button, input, textarea, select, label")) return;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!mobile && !event.target.closest("[data-hero-field], .hero-visual")) return;
    const pt = pointFromEvent(event);
    if (!pt) return;
    event.preventDefault();
    poke(nearest(pt.x, pt.y));
  };

  hero.addEventListener("pointerdown", onPlay);
}
