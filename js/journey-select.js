/**
 * Journey milestones: select a year to show image + full copy in the detail stage.
 */
export function initJourneySelect() {
  const list = document.querySelector("[data-journey-list]");
  const detail = document.querySelector("[data-journey-detail]");
  if (!list || !detail) return;

  const items = Array.from(list.querySelectorAll("[data-journey-item]"));

  const setActive = (item) => {
    items.forEach((el) => {
      const on = el === item;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", String(on));
    });

    const year = item.querySelector(".journey-year")?.textContent?.trim() || "";
    const html = item.querySelector("template")?.innerHTML?.trim() || "";
    const photo = item.querySelector(".journey-photo");
    const img = photo?.querySelector("img");
    const mediaMods = [
      photo?.classList.contains("journey-photo--contain") && "journey-detail-media--contain",
      photo?.classList.contains("journey-photo--mscrf") && "journey-detail-media--mscrf",
      photo?.classList.contains("journey-photo--lab") && "journey-detail-media--lab",
    ].filter(Boolean);

    const media = img
      ? `<div class="journey-detail-media journey-detail-media--medallion ${mediaMods.join(" ")}"><img src="${img.getAttribute("src")}" alt="" /></div>`
      : "";

    detail.classList.add("is-updating");
    detail.innerHTML = `${media}<div class="journey-detail-copy"><p class="microtype journey-detail-year">${year}</p>${html}</div>`;
    requestAnimationFrame(() => detail.classList.remove("is-updating"));
  };

  items.forEach((item) => {
    if (!item.querySelector(".journey-card-copy")) {
      const html = item.querySelector("template")?.innerHTML?.trim() || "";
      if (html) {
        const body = document.createElement("div");
        body.className = "journey-card-copy";
        body.innerHTML = html;
        item.appendChild(body);
      }
    }
    item.addEventListener("click", () => setActive(item));
  });

  list.addEventListener("keydown", (event) => {
    const current = items.findIndex((el) => el.classList.contains("is-active"));
    if (current < 0) return;
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(items.length - 1, current + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, current - 1);
    if (next === current) return;
    event.preventDefault();
    items[next].focus();
    setActive(items[next]);
  });

  if (items[0]) setActive(items[0]);
}
