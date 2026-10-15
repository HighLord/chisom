# Chisom's portfolio

Static Vite site. No database, no admin page.

## Run locally
    npm install
    npm run dev

## Deploy on Netlify
Connect the GitHub repo. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).

## Updating content
Edit these files, commit, and Netlify rebuilds by itself:
- `src/data/site.json`: name, tagline, about text, services, skills, client logos, kind words, email and social links. A social link with an empty `url` is hidden.
- `src/data/projects.json`: one entry per card in Work samples: `title`, `brand`, `category`, `summary`, `link` (a Google Doc or Drive folder shared as "Anyone with the link") and optional `cta` button text. Categories become the filter tabs automatically.
- `public/images/`: put pictures here and refer to them as `/images/file-name.jpg` (for `photo`, `cover` and logo `image`). An empty value shows a coloured placeholder.

## Adding a new piece of writing
1. Save its text as `public/works/<slug>.html` (plain `<p>`, `<h3>`, `<ul>` tags) and add an entry to `src/data/projects.json` with `slug`, `title`, `category`, `brand`, `summary` and `minutes` (reading time). The piece then appears under its category, with a generated cover.
2. Or add the Word/PDF file to the list in `scripts/convert_works.py` and run `python3 scripts/convert_works.py <folder-of-files>` (needs `pandoc` and `pdftotext` installed). It rewrites `projects.json` and all pages.
