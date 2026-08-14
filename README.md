# Hex House

The website for Hex House — 666 46th St, Oakland, California.

A static site. No build step, no dependencies, no framework. Four files:

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `style.css` | The look: dark, hexagonal, mildly cursed |
| `script.js` | The living honeycomb behind everything (canvas) |
| `favicon.svg` | Hexagon |
| `stamp.sh` | Refreshes the cache-busting version on the CSS and JS |

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


## After editing style.css or script.js — run `./stamp.sh`

`index.html` loads them with a version query:

```html
<link rel="stylesheet" href="style.css?v=708bb3cc">
<script src="script.js?v=227cd442"></script>
```

Browsers cache a URL, so an edit to `style.css` alone can go unseen for as long as the old copy
lives in someone's cache. Changing the URL is what forces the refetch.

`./stamp.sh` sets each version to the first 8 characters of that file's MD5. Content-derived, so
the URL changes exactly when the file does — no version numbering to keep track of, and re-running
it after a no-op edit changes nothing. Run it before you commit any CSS or JS change.

To never think about it again, have git run it for you:

```sh
printf '#!/bin/sh\n./stamp.sh && git add index.html\n' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Hooks aren't committed, so each clone installs its own.

## Deploying

Anywhere that serves static files. It's a folder of plain files — GitHub Pages, Netlify, Cloudflare
Pages, or `rsync` to any web host will all work as-is.
