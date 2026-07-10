#!/usr/bin/env python3
"""
Build news article pages from data/news.json.

Non-engineers: edit data/news.json, then run:
  python3 scripts/build-news.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "news.json"
NEWS_DIR = ROOT / "news"
TEMPLATE = ROOT / "news" / "_article-template.html"


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render_nav(items: list[dict], index: int) -> str:
    """JSON is newest-first. Left/Forward = newer; Right/Previous = older."""
    older = items[index + 1] if index + 1 < len(items) else None
    newer = items[index - 1] if index > 0 else None

    forward_html = (
        f"""            <a class="article-nav-link article-nav-forward" href="../{esc(newer['id'])}/" data-article-forward>
              <span class="article-nav-dir microtype">← Forward</span>
              <span class="article-nav-title font-display">{esc(newer['title'])}</span>
            </a>"""
        if newer
        else '<span class="article-nav-link article-nav-forward is-empty" aria-hidden="true"></span>'
    )
    prev_html = (
        f"""            <a class="article-nav-link article-nav-prev" href="../{esc(older['id'])}/" data-article-prev>
              <span class="article-nav-dir microtype">Previous →</span>
              <span class="article-nav-title font-display">{esc(older['title'])}</span>
            </a>"""
        if older
        else '<span class="article-nav-link article-nav-prev is-empty" aria-hidden="true"></span>'
    )

    return f"""
          <nav class="article-nav" aria-label="Article navigation" data-article-nav>
{forward_html}
{prev_html}
          </nav>"""


def render_article(item: dict, template: str, items: list[dict], index: int) -> str:
    body_html = "\n".join(f"              <p>{esc(p)}</p>" for p in item.get("body", []))
    links = item.get("links") or []
    if links:
        link_items = "\n".join(
            f'                <li><a href="{esc(link["url"])}" target="_blank" rel="noopener noreferrer">{esc(link["label"])}</a></li>'
            for link in links
        )
        links_html = f"""
            <div class="article-links surface surface-lg">
              <p class="microtype article-links-label">Published coverage</p>
              <ul>
{link_items}
              </ul>
            </div>"""
    else:
        links_html = ""

    html = template
    replacements = {
        "{{ID}}": esc(item["id"]),
        "{{TITLE}}": esc(item["title"]),
        "{{DATE}}": esc(item["date"]),
        "{{DATE_LABEL}}": esc(item["dateLabel"]),
        "{{TAG}}": esc(item.get("tag", "News")),
        "{{EXCERPT}}": esc(item.get("excerpt", "")),
        "{{BODY}}": body_html,
        "{{LINKS}}": links_html,
        "{{ARTICLE_NAV}}": render_nav(items, index),
    }
    for key, value in replacements.items():
        html = html.replace(key, value)
    return html


def main() -> None:
    items = json.loads(DATA.read_text(encoding="utf-8"))
    template = TEMPLATE.read_text(encoding="utf-8")
    NEWS_DIR.mkdir(exist_ok=True)

    # Clean previously generated article folders (keep template + index)
    for child in NEWS_DIR.iterdir():
        if child.is_dir():
            for f in child.glob("*"):
                f.unlink()
            child.rmdir()

    for index, item in enumerate(items):
        slug = item["id"]
        if not re.fullmatch(r"[a-z0-9-]+", slug):
            raise SystemExit(f"Invalid id (use lowercase letters, numbers, hyphens): {slug}")
        out_dir = NEWS_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(
            render_article(item, template, items, index), encoding="utf-8"
        )
        print(f"  wrote news/{slug}/index.html")

    # Listing page cards
    cards = []
    for item in items:
        cards.append(
            f"""            <a class="news-card surface surface-lg" href="{esc(item['id'])}/">
              <time class="microtype news-date" datetime="{esc(item['date'])}">{esc(item['dateLabel'])}</time>
              <h2 class="font-display news-title">{esc(item['title'])}</h2>
              <p class="news-excerpt">{esc(item['excerpt'])}</p>
              <span class="news-tag microtype">{esc(item.get('tag', 'News'))}</span>
            </a>"""
        )
    listing = (NEWS_DIR / "index.html").read_text(encoding="utf-8")
    start = "<!-- NEWS_CARDS_START -->"
    end = "<!-- NEWS_CARDS_END -->"
    if start not in listing or end not in listing:
        raise SystemExit("news/index.html missing NEWS_CARDS markers")
    before, rest = listing.split(start, 1)
    _, after = rest.split(end, 1)
    listing = before + start + "\n" + "\n".join(cards) + "\n            " + end + after
    (NEWS_DIR / "index.html").write_text(listing, encoding="utf-8")
    print("  updated news/index.html")
    print(f"Built {len(items)} articles from data/news.json")


if __name__ == "__main__":
    main()
