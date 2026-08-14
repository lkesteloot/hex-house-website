# Hex House

The website for Hex House — 666 46th St, Oakland, California.

A static site. No build step, no dependencies, no framework. Four files:

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `style.css` | The look: dark, hexagonal, mildly cursed |
| `script.js` | The living honeycomb behind everything (canvas) |
| `favicon.svg` | Hexagon |

## Running it locally

Open `index.html` in a browser, or serve the directory:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## What's interactive

- **The background** — click cast a ring outward through the grid.
- **The residents** — hover a hexagon and the whole background grid takes on that person's color.
- **Type `666`** anywhere on the page.

Also: the grid twinkles on its own, follows the cursor, and reflows on resize. All animation respects `prefers-reduced-motion`.


## Deploying

Anywhere that serves static files. It's a folder of plain files — GitHub Pages, Netlify, Cloudflare
Pages, or `rsync` to any web host will all work as-is.
