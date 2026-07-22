# How to add or edit news (non-engineers)

You only need to edit **one file**, then run **one command**.

## 1. Edit the news list

Open:

`data/news.json`

Copy an existing block and change the fields:

```json
{
  "id": "short-url-name",
  "date": "2026-03",
  "dateLabel": "March 2026",
  "title": "Your headline here",
  "excerpt": "One or two sentences for the card preview.",
  "tag": "Grant",
  "body": [
    "First paragraph on the article page.",
    "Second paragraph."
  ],
  "links": [
    {
      "label": "Read the press release",
      "url": "https://example.com/full-article"
    }
  ]
}
```

### Field tips

| Field | What to put |
|-------|-------------|
| `id` | Lowercase only, hyphens OK (`fda-clearance-2026`). Becomes the page URL. |
| `date` | `YYYY-MM` for sorting |
| `dateLabel` | What people see (`March 2026`) |
| `tag` | Short label: `Grant`, `Clinical`, `Regulatory`, `Partnership`, `Product` |
| `body` | Each string = one paragraph on the article page |
| `links` | Buttons/links to the original PR or publisher page |

Put **newest items first** in the file.

## 2. Rebuild the article pages

In Terminal, from the `britecyte-website` folder:

```bash
python3 scripts/build-news.py
```

That creates/updates:

- `news/your-id/index.html` (each article page)
- `news/index.html` (full news list)

The homepage news cards load automatically from `data/news.json` — no extra step.

## 3. Preview

With the local server running (`python3 serve.py`), open:

- http://127.0.0.1:8002/#news
- http://127.0.0.1:8002/news/

## Don’t break the JSON

- Keep commas between items
- No trailing comma after the last item
- Use straight quotes `"` only
- If something fails, paste the file into https://jsonlint.com to find the typo
