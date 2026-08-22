/**
 * Team: desktop uses the featured pane; mobile uses portrait cards with a bio overlay.
 */
export function initTeamBios() {
  const grid = document.querySelector("[data-team-grid]");
  const detail = document.querySelector("[data-team-bio]");
  if (!grid || !detail) return;

  const cards = Array.from(grid.querySelectorAll("[data-team-card]"));
  const mobile = window.matchMedia("(max-width: 1023px)");
  const stage = detail.parentElement;

  cards.forEach((card) => {
    if (card.querySelector(".team-card-bio")) return;
    const html = card.querySelector("template")?.innerHTML?.trim();
    if (!html) return;
    const inner = card.querySelector(".team-card-inner");
    if (!inner) return;
    const bio = document.createElement("div");
    bio.className = "team-card-bio";
    bio.innerHTML = html;
    inner.appendChild(bio);
  });

  const fillDetail = (card) => {
    const name = card.querySelector(".team-card-name-text")?.textContent?.trim() || "";
    const title = card.querySelector(".team-card-title")?.textContent?.trim() || "";
    const bio = card.querySelector("template")?.innerHTML?.trim() || "";
    const img = card.querySelector(".team-card-photo");
    const media = img
      ? `<div class="team-detail-media"><img src="${img.getAttribute("src")}" alt="" /><div class="team-detail-credit"><h3 class="font-display team-bio-name">${name}</h3><p class="team-bio-role">${title}</p></div></div>`
      : "";

    detail.innerHTML = `
      ${media}
      <div class="team-detail-copy">
        <h3 class="font-display team-bio-name">${name}</h3>
        <p class="team-bio-role">${title}</p>
        <div class="team-bio-copy">${bio}</div>
      </div>
    `;
    if (stage) stage.appendChild(detail);
  };

  const setActive = (card) => {
    cards.forEach((item) => {
      const on = item === card;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-pressed", String(on));
    });

    if (!mobile.matches) {
      detail.classList.add("is-updating");
      fillDetail(card);
      requestAnimationFrame(() => detail.classList.remove("is-updating"));
    }
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => setActive(card));
  });

  grid.addEventListener("keydown", (event) => {
    const current = cards.findIndex((el) => el.classList.contains("is-active"));
    if (current < 0) return;
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(cards.length - 1, current + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, current - 1);
    if (next === current) return;
    event.preventDefault();
    cards[next].focus();
    setActive(cards[next]);
  });

  mobile.addEventListener("change", () => {
    const current = cards.find((item) => item.classList.contains("is-active")) || cards[0];
    if (current) setActive(current);
  });

  if (cards[0]) setActive(cards[0]);
}
