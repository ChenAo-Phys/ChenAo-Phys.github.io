# aochen_page

Personal academic homepage for **Ao Chen (陈骜)** — postdoctoral researcher,
The Chan Group, California Institute of Technology.

The page is set like the front matter of a physics journal article: serif
headings, a crimson accent and a numbered margin rail.

* **Masthead** — name, the Role / Group / Since readout, three research-direction
  tiles (neural quantum states, high-T<sub>c</sub> superconductivity, AI for
  physics), each an isometric line-art emblem plus a label, and a row of icon
  buttons (CV, email, GitHub, Google Scholar). Each icon button has an
  `aria-label` and a text tooltip on hover and keyboard focus.
* **Sections, in order:** 01 Roadmap · 02 Research highlights · 03 Experience
  (education, research positions, honors) · 04 Software · 05 Publications ·
  06 Contact (visible email address with a copy button, plus the same icon row).
* **Figure 1, the roadmap**, follows the layout of the Google Quantum AI
  roadmap. A wide plate (up to 1200px) holds a strip of eight milestone
  columns: illustration, "Milestone n", short title, a metric or citation line,
  and a dot on a timeline track with the date under it. A "Now · 2026" tick sits
  between steps 2 and 3. Below the strip, a detail panel shows the selected
  milestone: a full title, a short description, citations with Paper/Code
  buttons, and a larger copy of the illustration. Achieved steps (0–2) have
  filled crimson dots and a solid track. Projected steps (3–6) have hollow
  dashed dots, a dashed track, italic dates and illustrations at reduced
  contrast, and are labelled "Projected milestone — no publication yet."
  When the seven columns don't fit (below about 1010px), the strip becomes a
  horizontal scroll-snap carousel.

## Structure

```
index.html                 the whole page (single document)
assets/css/style.css       all styling; tokens + light/dark themes
assets/js/main.js          theme toggle, scroll-spy, reveal, copy-email,
                           roadmap tabs and #step-N deep links
assets/img/avatar.jpg      portrait
assets/files/AoChen_CV.pdf CV
contents.md                source outline for the page content
```

There is **no build step and no package manager**. The site is plain static
HTML, CSS and JavaScript with zero external dependencies — no CDN fonts, no
math library, no analytics. It renders correctly with the network switched off.

## Preview locally

From the repository root:

```sh
python3 -m http.server 8000
```

then open <http://localhost:8000/>.

Opening `index.html` directly via `file://` also works; all asset paths are
relative.

## Editing the content

* All page content lives in `index.html`. Facts, titles, dates and URLs mirror
  `contents.md` and the CV — update both together.
* Colours, type scale and spacing are CSS custom properties at the top of
  `assets/css/style.css`. Both themes are defined from the same token set:
  `:root` (light), `:root[data-theme="dark"]`, and a
  `prefers-color-scheme: dark` block guarded by `:root:not([data-theme="light"])`.
* The theme choice is stored in `localStorage` under the key `theme`; an inline
  script in `<head>` applies it before first paint so there is no flash.
* JavaScript is strictly progressive enhancement. With JS disabled the page is
  complete: all sections visible, all links live, the collapsed 21-author list
  still expandable (it is a native `<details>`), and the theme follows the OS
  setting. In the roadmap, every milestone panel is shown, stacked in order,
  and the strip items are plain links to `#step-0` … `#step-7`.
* With JS the roadmap strip follows the WAI-ARIA Tabs pattern: `tablist` / `tab` /
  `tabpanel`, roving tabindex, ←/→/Home/End keys, and only the selected panel
  is shown. The default selection is step 2, the latest achieved step. Loading
  or following a link to `#step-N` (for example the "Evidence for step N" links
  in Research highlights) selects that step and scrolls its panel into view.
  Clicking a milestone updates the URL hash, so the URL can be shared.

## Illustrations

All illustrations are inline SVG, which keeps them working under `file://`,
where external sprites fail. They contain no colours of their own. They draw
with `currentColor` and a few classes that `style.css` defines from the theme
tokens: `.f` for opaque faces (filled with the colour of the surface they sit
on), `.a` / `.af` for the single accent detail, `.k` for solid ink dots, `.d`
for dotted "rising" lines and `.t` for thin strokes. They follow both themes
automatically.

* Roadmap tiles use the `ill` class and a `viewBox="0 0 240 180"`, drawn
  bottom-aligned on a shared baseline. Every tile appears twice, in the strip
  and in its panel.
* Research-direction emblems use `ill emb` and a `viewBox="0 0 120 96"`.
* UI glyphs use the `glyph` class and a `viewBox="0 0 24 24"`.

To replace an illustration, paste the new `<svg>` element in place of the old
one. Do not add `id`s, because each tile appears twice on the page.

## Accessibility and print

* Semantic landmarks (`<nav>`, `<header>`, `<main>`, `<footer>`), one `<h1>`,
  section headings in order, a skip link, visible focus rings, and alt text.
* WCAG AA contrast in both themes; `prefers-reduced-motion` disables all
  motion and reveal animations.
* A print stylesheet forces the light palette, hides navigation chrome and the
  milestone strip, prints every roadmap panel, expands author lists, and
  appends external URLs after links.

## Deploying

Any static host works — copy the repository contents as-is. No build output,
no server-side code.
