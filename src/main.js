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
  ["about", "About", list(site.about).length > 0],
  ["services", "Services", list(site.services).length > 0],
  ["skills", "Skills", list(site.skills).length > 0],
  ["work", "Work", true],
  ["kind-words", "Kind words", list(site.testimonials).length > 0],
  ["contact", "Contact", true],
].filter((s) => s[2]);

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

function workHTML() {
  if (!projects.length) return `<p class="muted">New work is on its way.</p>`;
  const tabs = [ALL_LABEL, ...categories]
    .map((c, i) => `<button type="button" class="tab" data-cat="${i ? esc(c) : ""}" aria-pressed="${i === 0}">${esc(c)}</button>`)
    .join("");
  const cards = projects
    .map(
      (p) => `<article class="card glow wcard" data-cat="${esc(p.category)}"><p class="eyebrow">${esc(p.brand || p.category)}</p><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${safeUrl(p.link) ? externalLink(p.link, "more", `${esc(p.cta || "Read document")} &rarr;`) : ""}</article>`
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
${services ? section("services", "Services I offer", `<div class="grid">${services}</div>`) : ""}
${list(site.skills).length ? section("skills", "My expertise", `<ul class="chips">${list(site.skills).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`) : ""}
${section("work", "Work samples", workHTML())}
${quotes ? section("kind-words", "Kind words", `<div class="grid">${quotes}</div>`) : ""}
${section("contact", "Let's work together", `<p class="lead">Get in touch through any of the options below.</p><div class="cta">${contactLinks}</div>`)}
<footer>&copy; ${new Date().getFullYear()} ${esc(site.name)}. ${esc(site.role)}.</footer>`;
}

$("#app").innerHTML = `
<header><a class="brand" href="#home">${esc(site.name)}</a>
<button id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span></button>
<nav id="nav" aria-label="Main">${sections.map(([id, label]) => `<a href="#${id}" data-nav="${id}">${label}</a>`).join("")}</nav></header>
<main>${homeHTML()}</main>`;
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
