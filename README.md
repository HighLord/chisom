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
- `src/data/projects.json`: one entry per piece of work (`slug` must be unique, lowercase, with dashes only).
- `public/images/`: put pictures here and refer to them as `/images/file-name.jpg` (for `photo`, `cover` and logo `image`). An empty value shows a coloured placeholder.
