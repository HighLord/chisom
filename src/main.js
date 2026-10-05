import "./style.css";
import site from "./data/site.json";
import projects from "./data/projects.json";

const STAR_COUNT = 70;
const STAR_DRIFT = 0.06;
const TWO_PI = Math.PI * 2;
const MIN_LOGO_ITEMS = 10;
const MENU_CLOSE_KEY = "Escape";
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

const socials = list(site.social).filter((s) => safeUrl(s.url));
const sections = [
  ["home", "Home", true],
  ["about", "About", list(site.about).length > 0],
  ["services", "Services", list(site.services).length > 0],
  ["skills", "Skills", list(site.skills).length > 0],
  ["work", "Work", true],
  ["kind-words", "Kind words", list(site.testimonials).length > 0],
  ["contact", "Contact", true],
].filter((s) => s[2]);

function socialLinks(className) {
  return `<ul class="${className}">${socials
    .map((s) => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`)
    .join("")}</ul>`;
}

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
  const rows = projects
    .map(
      (p, i) => `<li><a class="row" href="#/work/${esc(p.slug)}" data-i="${i}"><span class="thumb zoom">${media(p.cover, p.title, p.title)}</span><span class="rt">${esc(p.title)}</span><span class="rc">${esc(p.category)}</span></a></li>`
    )
    .join("");
  const first = projects[0];
  return `<div class="work"><ul class="rows">${rows}</ul><div class="preview zoom" id="preview" aria-hidden="true">${media(first.cover, first.title, first.title)}</div></div>`;
}

function homeHTML() {
  const section = (id, title, body) => `<section id="${id}" class="sec reveal"><h2>${title}</h2>${body}</section>`;
  const about = list(site.about).map((t) => `<p>${esc(t)}</p>`).join("");
  return `
<section id="home" class="hero"><p class="eyebrow">${esc(site.role)}</p><h1>${esc(site.name)}</h1><p class="lead">${esc(site.tagline)}</p>
<div class="cta"><a class="btn" href="#/" data-goto="work">See my work</a><a class="btn ghost" href="#/" data-goto="contact">Contact me</a></div></section>
${clientsHTML()}
${list(site.about).length ? section("about", "About", `<div class="about"><div class="portrait zoom">${media(site.photo, site.name, site.name)}</div><div>${about}</div></div>`) : ""}
${list(site.services).length ? section("services", "Services", `<div class="grid">${list(site.services).map((s) => `<div class="card glow"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("")}</div>`) : ""}
${list(site.skills).length ? section("skills", "Skills", `<ul class="chips">${list(site.skills).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`) : ""}
${section("work", "Work", workHTML())}
${list(site.testimonials).length ? section("kind-words", "Kind words", `<div class="grid">${list(site.testimonials).map((t) => `<figure class="card glow"><blockquote>${esc(t.quote)}</blockquote><figcaption>${esc(t.author)}${t.role ? ", " + esc(t.role) : ""}</figcaption></figure>`).join("")}</div>`) : ""}
${section("contact", "Contact", `<p>Have a project in mind? Let's talk.</p><p><a class="btn" href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>${socials.length ? socialLinks("links") : ""}`)}
<footer>&copy; ${new Date().getFullYear()} ${esc(site.name)}</footer>`;
}

function projectHTML(p) {
  const link = safeUrl(p.link);
  return `<article class="project"><a class="back" href="#/" data-goto="work">&larr; Back to work</a>
<div class="pcover zoom">${media(p.cover, p.title, p.title)}</div>
<p class="eyebrow">${esc(p.category)}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.summary)}</p>
<ul class="chips">${list(p.skills).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
${list(p.body).map((t) => `<p>${esc(t)}</p>`).join("")}
${link ? `<p><a class="btn" href="${esc(link)}" target="_blank" rel="noopener noreferrer">View live</a></p>` : ""}</article>`;
}

$("#app").innerHTML = `
<button id="burger" aria-label="Menu" aria-expanded="false" aria-controls="side"><span></span></button>
<aside id="side"><a class="brand" href="#/" data-goto="home">${esc(site.name)}</a>
<nav aria-label="Main">${sections.map(([id, label]) => `<a href="#/" data-goto="${id}" data-nav="${id}">${label}</a>`).join("")}</nav>
${socials.length ? socialLinks("links side-links") : ""}</aside>
<main><div id="home-view">${homeHTML()}</div><div id="project-view" hidden></div></main>`;

const homeView = $("#home-view");
const projectView = $("#project-view");
const side = $("#side");
const burger = $("#burger");
let pendingSection = null;
let homeScrollY = 0;

const setActive = (id) =>
  document.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));

function scrollToPending() {
  const target = pendingSection && document.getElementById(pendingSection);
  pendingSection = null;
  if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

function showHome() {
  projectView.hidden = true;
  homeView.hidden = false;
  document.title = `${site.name} | ${site.role}`;
  requestAnimationFrame(() => (pendingSection ? scrollToPending() : window.scrollTo(0, homeScrollY)));
}

function showProject(slug) {
  const project = projects.find((p) => p.slug === slug);
  if (!homeView.hidden) homeScrollY = window.scrollY;
  homeView.hidden = true;
  projectView.hidden = false;
  projectView.innerHTML = project
    ? projectHTML(project)
    : `<article class="project"><a class="back" href="#/" data-goto="work">&larr; Back to work</a><h1>Page not found</h1></article>`;
  document.title = `${project ? project.title : "Not found"} | ${site.name}`;
  window.scrollTo(0, 0);
  setActive("work");
}

function route() {
  const match = location.hash.match(/^#\/work\/([\w-]+)$/);
  if (match) showProject(match[1]);
  else showHome();
}

const closeMenu = () => {
  side.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
};

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-goto]");
  if (!link) return;
  event.preventDefault();
  pendingSection = link.dataset.goto;
  closeMenu();
  if (homeView.hidden) location.hash = "#/";
  else scrollToPending();
});
burger.addEventListener("click", () => {
  const open = side.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
});
document.addEventListener("keydown", (e) => e.key === MENU_CLOSE_KEY && closeMenu());
addEventListener("hashchange", route);

const preview = $("#preview");
document.querySelectorAll(".row").forEach((row) => {
  const show = () => {
    const p = projects[Number(row.dataset.i)];
    preview.innerHTML = media(p.cover, p.title, p.title);
  };
  row.addEventListener("mouseenter", show);
  row.addEventListener("focus", show);
});

const reveal = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), reveal.unobserve(e.target))),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

const spy = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && !homeView.hidden && setActive(e.target.id)),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("#home-view section[id]").forEach((el) => spy.observe(el));

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
route();
setActive("home");
