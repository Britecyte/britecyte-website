/**
 * Homepage news cards — loaded from data/news.json
 */
export async function initNewsGrid() {
  const grid = document.querySelector("[data-news-grid]");
  if (!grid) return;

  try {
    const res = await fetch(new URL("../data/news.json", import.meta.url));
    if (!res.ok) throw new Error(`news.json ${res.status}`);
    const items = await res.json();
    const limit = Number(grid.dataset.newsLimit || items.length);
    grid.innerHTML = items.slice(0, limit).map(cardHtml).join("");
  } catch (err) {
    console.error("Failed to load news:", err);
    grid.innerHTML = `<p class="news-load-error">Unable to load news right now. <a href="news/">View news archive</a>.</p>`;
  }
}

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cardHtml(item) {
  return `
    <a class="news-card surface surface-lg" href="news/${esc(item.id)}/">
      <time class="microtype news-date" datetime="${esc(item.date)}">${esc(item.dateLabel)}</time>
      <h3 class="font-display news-title">${esc(item.title)}</h3>
      <p class="news-excerpt">${esc(item.excerpt)}</p>
      <span class="news-tag microtype">${esc(item.tag || "News")}</span>
    </a>`;
}
