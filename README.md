# Hex House

The website for Hex House — 666 46th St, Oakland, California.

A static site. No build step, no dependencies, no framework. Four files:

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `style.css` | The look: dark, hexagonal, mildly cursed |
| `script.js` | The living honeycomb behind everything (canvas) |
| `favicon.svg` | `0x` in a hexagon |

## Running it locally

Open `index.html` in a browser, or serve the directory:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## What's interactive

- **The sigil** — click it. Every click rotates it 60° (six clicks = one full turn) and casts a ring outward through the grid. Clicking anywhere else on the page does the same from that point.
- **The address** — hover `666` or `46th` to see it in base sixteen. The page also shows this off once on load.
- **The residents** — hover a hexagon and the whole background grid takes on that person's color.
- **Type `666`** anywhere on the page.

Also: the grid twinkles on its own, follows the cursor, and reflows on resize. All animation respects `prefers-reduced-motion`.

## Adding a resident

One `<li class="cell">` in the `.comb` list in `index.html`, with a `--c` custom property and a matching
`data-color`. Both should be the same hex color — the CSS uses one and the JS reads the other.

```html
<li class="cell" style="--c:#4ADE80" data-color="#4ADE80">
  <div class="hexagon">
    <span class="glyph">N</span>
    <span class="name">Newcomer</span>
    <span class="code">#4ADE80</span>
  </div>
</li>
```

The honeycomb zigzag alternates on even/odd children, so it stays a honeycomb at any count.

## Deploying

Anywhere that serves static files. It's a folder of plain files — GitHub Pages, Netlify, Cloudflare
Pages, or `rsync` to any web host will all work as-is.
