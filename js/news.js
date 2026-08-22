/**
 * News cards — loaded from data/news.json
 * Cards link straight to the publication / press release / source URL.
 */
export async function initNewsGrid() {
  const grids = document.querySelectorAll("[data-news-grid]");
  if (!grids.length) return;

  try {
    const res = await fetch(new URL("../data/news.json", import.meta.url));
    if (!res.ok) throw new Error(`news.json ${res.status}`);
    const items = await res.json();

    grids.forEach((grid) => {
      const limit = Number(grid.dataset.newsLimit || items.length);
      const heading = grid.classList.contains("news-grid--page") ? "h2" : "h3";
      grid.innerHTML = items.slice(0, limit).map((item) => cardHtml(item, heading)).join("");
    });
  } catch (err) {
    console.error("Failed to load news:", err);
    grids.forEach((grid) => {
      grid.innerHTML = `<p class="news-load-error">Unable to load news right now. <a href="news/">View all news</a>.</p>`;
    });
  }
}

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Resolve first source link to a URL usable from any page on the site. */
function sourceHref(item) {
  const raw = item?.links?.[0]?.url;
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//") || raw.startsWith("mailto:")) {
    return raw;
  }
  const cleaned = String(raw)
    .replace(/^\.\.\/\.\.\//, "")
    .replace(/^\.\.\//, "")
    .replace(/^\//, "");
  return new URL(`../${cleaned}`, import.meta.url).href;
}

function cardHtml(item, heading = "h3") {
  const href = sourceHref(item);
  if (!href) return "";
  const external = /^https?:\/\//i.test(href) || href.includes("/assets/");
  const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `
    <a class="news-card surface surface-lg" href="${esc(href)}"${target}>
      <time class="microtype news-date" datetime="${esc(item.date)}">${esc(item.dateLabel)}</time>
      <${heading} class="font-display news-title">${esc(item.title)}</${heading}>
      <p class="news-excerpt">${esc(item.excerpt)}</p>
    </a>`;
}
