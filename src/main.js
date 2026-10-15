import "./style.css";
import site from "./data/site.json";
import projects from "./data/projects.json";

const STAR_COUNT = 70;
const STAR_DRIFT = 0.06;
const TWO_PI = Math.PI * 2;
const MIN_LOGO_ITEMS = 10;
const ALL_LABEL = "All Work";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (selector, root = document) => root.querySelector(selector);
const list = (value) => (Array.isArray(value) ? value : []);
const esc = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Only http(s), mailto and tel links are rendered, so a typo in the data files can never inject script URLs.
const safeUrl = (url) => (/^(https?:|mailto:|tel:)/i.test(url || "") ? url : "");
const initials = (text) => String(text).split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const media = (src, alt, label) =>
  src
    ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
    : `<div class="ph" role="img" aria-label="${esc(alt)}"><span>${esc(initials(label))}</span></div>`;
const externalLink = (url, className, text) =>
  `<a class="${className}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${text}</a>`;

const socials = list(site.social).filter((s) => safeUrl(s.url));
const categories = [...new Set(projects.map((p) => p.category))];
const sections = [
  ["about", "About", true],
  ["work", "Works", true],
  ["contact", "Contact", true],
];

function clientsHTML() {
  const logos = list(site.logos);
  if (!logos.length) return "";
  const repeat = Math.max(1, Math.ceil(MIN_LOGO_ITEMS / logos.length));
  const items = logos
    .map((l) => `<li>${l.image ? `<img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy">` : `<span>${esc(l.name)}</span>`}</li>`)
    .join("")
    .repeat(repeat);
  return `<div class="marquee" aria-label="Clients"><div class="lane"><ul>${items}</ul><ul aria-hidden="true">${items}</ul></div></div>`;
}

const COVER_PALETTES = [["#1b2d63", "#d9692a"], ["#0f1f4a", "#f08a4b"], ["#24366f", "#b9531c"], ["#122056", "#e07b39"], ["#1a2a5e", "#c75a1e"]];
const PAGE_ICON = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>';
const ICONS = {
  "Website Copy": PAGE_ICON,
  "Email Marketing": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  "Sales Copy & Scripts": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
  "Ads & Product Copy": '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  Newsletters: '<path d="M5 4h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2z"/><path d="M9 8h5M9 12h5M9 16h3"/>',
  "Blog & Articles": '<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="m14 6 3 3"/>',
};

// Every piece gets a designed cover generated from its title and category, so no image files are needed.
function coverHTML(p, index, kind = "") {
  const [from, to] = COVER_PALETTES[index % COVER_PALETTES.length];
  return `<div class="cover ${kind}" style="--c1:${from};--c2:${to}" aria-hidden="true"><svg class="cicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.category] || PAGE_ICON}</svg><span class="ctag">${esc(p.brand || p.category)}</span><span class="ctitle">${esc(p.title)}</span></div>`;
}

function workHTML() {
  if (!projects.length) return `<p class="muted">New work is on its way.</p>`;
  const tabs = [ALL_LABEL, ...categories]
    .map((c, i) => `<button type="button" class="tab" data-cat="${i ? esc(c) : ""}" aria-pressed="${i === 0}">${esc(c)}</button>`)
    .join("");
  const cards = projects
    .map(
      (p, i) => `<article class="card glow wcard" data-cat="${esc(p.category)}">${coverHTML(p, i)}<div class="cbody"><p class="eyebrow">${esc(p.category)} &middot; ${p.minutes} min read</p><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><button type="button" class="more" data-open="${esc(p.slug)}">Read this piece &rarr;</button></div></article>`
    )
    .join("");
  return `<div class="tabs" role="group" aria-label="Filter work">${tabs}</div><div class="grid" id="cards">${cards}</div>`;
}

function homeHTML() {
  const section = (id, title, body) => `<section id="${id}" class="sec reveal"><h2>${title}</h2>${body}</section>`;
  const about = list(site.about).map((t) => `<p>${esc(t)}</p>`).join("");
  const services = list(site.services)
    .map((s, i) => `<div class="card glow"><span class="num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`)
    .join("");
  const quotes = list(site.testimonials)
    .map((t) => `<figure class="card glow"><blockquote>${esc(t.quote)}</blockquote><figcaption>${esc(t.author)}${t.role ? ", " + esc(t.role) : ""}</figcaption></figure>`)
    .join("");
  const contactLinks = [`<a class="btn" href="mailto:${esc(site.email)}">Email</a>`, ...socials.map((s) => externalLink(s.url, "btn ghost", esc(s.label)))].join("");
  return `
<section id="home" class="hero"><div><p class="eyebrow">${esc(site.role)}</p><h1>${esc(site.tagline)}</h1><p class="lead">${esc(site.intro)}</p>
<div class="cta"><a class="btn" href="#work">View my work</a><a class="btn ghost" href="#contact">Let's work together</a></div></div>
<div class="portrait zoom">${media(site.photo, site.name, site.name)}</div></section>
${clientsHTML()}
${list(site.about).length ? section("about", "About", about) : ""}


${section("work", "Work samples", workHTML())}

${section("contact", "Let's work together", `<p class="lead">Get in touch through any of the options below.</p><div class="cta">${contactLinks}</div>`)}
<footer>&copy; ${new Date().getFullYear()} ${esc(site.name)}. ${esc(site.role)}.</footer>`;
}

$("#app").innerHTML = `
<header><a class="brand" href="#home">${esc(site.name)}</a>
<button id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span></button>
<nav id="nav" aria-label="Main">${sections.map(([id, label]) => `<a href="#${id}" data-nav="${id}">${label}</a>`).join("")}</nav></header>
<main>${homeHTML()}</main>
<dialog id="reader" aria-label="Reading view"></dialog>`;
document.title = `${site.name} | ${site.role}`;

const nav = $("#nav");
const burger = $("#burger");
const closeMenu = () => {
  nav.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
};
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (e) => e.target.closest("a") && closeMenu());
document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

// Work filter: each tab shows only the cards of its category; the first tab shows everything.
document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
    document.querySelectorAll(".wcard").forEach((card) => (card.hidden = Boolean(tab.dataset.cat) && card.dataset.cat !== tab.dataset.cat));
  })
);

// Reader: each piece opens in a dialog on this page, so visitors never leave the portfolio.
const reader = $("#reader");
const READ_HASH = /^#read=([\w-]+)$/;
const piecesBySlug = new Map(projects.map((p, i) => [p.slug, { p, i }]));
let readToken = 0;

async function showReader(slug) {
  const entry = piecesBySlug.get(slug);
  if (!entry) return hideReader();
  const { p, i } = entry;
  const siblings = projects.filter((x) => x.category === p.category);
  const next = siblings[(siblings.indexOf(p) + 1) % siblings.length];
  reader.innerHTML = `<div class="rwrap"><button type="button" class="rclose" data-close aria-label="Close">&times;</button>${coverHTML(p, i, "banner")}
<article class="rbody"><p class="eyebrow">${esc(p.category)} &middot; ${p.minutes} min read</p><h2>${esc(p.title)}</h2><div class="prose"><p class="muted">Loading...</p></div>
${siblings.length > 1 ? `<button type="button" class="btn ghost rnext" data-open="${esc(next.slug)}">Next in ${esc(p.category)} &rarr;</button>` : ""}</article></div>`;
  if (!reader.open) {
    reader.showModal();
    document.body.classList.add("noscroll");
  }
  reader.scrollTop = 0;
  const token = ++readToken;
  const prose = $(".prose", reader);
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}works/${slug}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // The pages are sanitized to plain text tags when they are converted (see scripts/convert_works.py).
    if (token === readToken) prose.innerHTML = html;
  } catch (error) {
    if (token === readToken) prose.innerHTML = '<p class="muted">Sorry, this piece could not be loaded. Please try again.</p>';
  }
}

const hideReader = () => reader.open && reader.close();
const syncReader = () => {
  const match = location.hash.match(READ_HASH);
  if (match) showReader(match[1]);
  else hideReader();
};

// Opening adds a history entry, so the phone's Back button closes the piece instead of leaving the site.
document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) {
    history[reader.open ? "replaceState" : "pushState"](null, "", `#read=${opener.dataset.open}`);
    syncReader();
    return;
  }
  if (e.target === reader || e.target.closest("[data-close]")) reader.close();
});
reader.addEventListener("close", () => {
  document.body.classList.remove("noscroll");
  if (READ_HASH.test(location.hash)) history.back();
});
addEventListener("popstate", syncReader);

const reveal = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), reveal.unobserve(e.target))),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    }),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((el) => spy.observe(el));

// A slowly drifting field of twinkling points; a few are burnt orange to echo the accent colour.
function startSky() {
  const canvas = $("#sky");
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;

  const resize = () => {
    const ratio = devicePixelRatio || 1;
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * TWO_PI,
      speed: Math.random() * 0.5 + 0.5,
      color: i % 9 === 0 ? "#f08a4b" : "#cfd8ff",
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      s.y -= STAR_DRIFT * s.speed;
      if (s.y < -2) {
        s.y = height + 2;
        s.x = Math.random() * width;
      }
      ctx.globalAlpha = 0.3 + 0.5 * Math.sin((time / 1500) * s.speed + s.phase) ** 2;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
      ctx.fill();
    }
  };

  const loop = (time) => {
    draw(time);
    frame = requestAnimationFrame(loop);
  };

  resize();
  addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw(0);
  });
  if (reduceMotion) return draw(0);
  frame = requestAnimationFrame(loop);
  // No point animating while the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(frame);
    if (!document.hidden) frame = requestAnimationFrame(loop);
  });
}

startSky();
syncReader();
