/* Denno Butchery Chokaa – script.js
   EDIT THE SETTINGS AND PRODUCT LIST BELOW. Everything else can stay as is. */

// ---- Settings ----------------------------------------------------------
const BUSINESS_NAME = "Denno Butchery Chokaa";
const WHATSAPP_NUMBER = "254795410514";        // international format, no + or spaces

// ---- Products ----------------------------------------------------------
// unit: "kg" (sold by weight, e.g. 0.5 kg) or "chicken" (sold per whole chicken).
// price: number in KSh per unit (per kg, or per chicken), or null if not confirmed yet (e.g. liver).
// available: set to false to stop orders for a product.
// image: path of your photo inside the images folder (see README).
const PRODUCTS = [
  { id: "goat",    name: "Goat Meat", price: 900,  available: true, image: "images/goat.jpg",    alt: "Goat carcasses hanging on butcher hooks" },
  { id: "chicken", name: "Chicken",   price: 500,  unit: "chicken",  available: true, image: "images/chicken.jpg", alt: "Whole raw chicken" },
  { id: "liver",   name: "Liver",     price: null, available: true, image: "images/liver.jpg",   alt: "Sliced liver" }
];

// ---- Helpers -----------------------------------------------------------
const $ = (id) => document.getElementById(id);
let basket = []; // [{ id, qty }]

const money = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");
const find = (id) => PRODUCTS.find((p) => p.id === id);

const UNITS = {
  kg:      { min: 0.25, max: 50, step: 0.5, whole: false, per: "/kg",          label: "Quantity (kg)",                aria: "kilograms",
             fmt: (n) => String(Number(n.toFixed(2))) + " kg" },
  chicken: { min: 1,    max: 30, step: 1,   whole: true,  per: " per chicken", label: "Quantity (number of chickens)", aria: "chickens",
             fmt: (n) => n + (n === 1 ? " chicken" : " chickens") }
};
const U = (p) => UNITS[p.unit || "kg"];
const fmtQty = (p, n) => U(p).fmt(n);

function el(tag, props, ...kids) {
  const node = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k === "class") node.className = v; else node.setAttribute(k, v);
  });
  kids.forEach((k) => node.append(k));   // append() treats strings as text, never HTML
  return node;
}

function parseQty(value, p) {
  const u = U(p);
  const n = Number(String(value).trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  if (u.whole && !Number.isInteger(n)) return null;
  const r = u.whole ? n : Math.round(n * 100) / 100;
  return r < u.min || r > u.max ? null : r;
}
function qtyError(p) {
  const u = U(p);
  return u.whole ? `Enter a whole number of chickens (${u.min} to ${u.max}).`
                 : `Enter a quantity between ${u.min} and ${u.max} kg (for example 0.5 or 2).`;
}

function waLink(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + (message ? "?text=" + encodeURIComponent(message) : "");
}

// ---- Product cards -----------------------------------------------------
function renderProducts() {
  const grid = $("products");
  grid.textContent = "";
  PRODUCTS.forEach((p) => {
    const photo = el("div", { class: "photo tone-" + p.id }, el("span", { class: "nophoto", "aria-hidden": "true" }, p.name));
    const img = el("img", { src: p.image, alt: p.alt, loading: "lazy", width: "800", height: "600" });
    img.addEventListener("load", () => photo.querySelector(".nophoto")?.remove());
    img.addEventListener("error", () => img.remove());  // neutral fallback stays visible
    photo.append(img);

    const priced = typeof p.price === "number";
    const priceEl = priced
      ? el("p", { class: "price" }, money(p.price) + U(p).per)
      : el("p", { class: "price tbc" }, "Contact us for today's price");

    const input = el("input", { id: "q-" + p.id, type: "number", inputmode: "decimal", min: U(p).min, max: U(p).max, step: String(U(p).step), value: "1", "aria-label": p.name + " quantity in " + U(p).aria });
    const minus = el("button", { type: "button", "aria-label": "Decrease " + p.name + " quantity" }, "−");
    const plus = el("button", { type: "button", "aria-label": "Increase " + p.name + " quantity" }, "+");
    const step = (d) => {
      const cur = parseQty(input.value, p) || U(p).min;
      input.value = String(Math.min(U(p).max, Math.max(U(p).min, cur + d)));
    };
    minus.addEventListener("click", () => step(-U(p).step));
    plus.addEventListener("click", () => step(U(p).step));

    const err = el("p", { class: "err", role: "alert" });
    const add = el("button", { type: "button", class: "btn btn-red" }, p.available ? "Add to Order" : "Currently unavailable");
    if (!p.available) add.disabled = true;
    add.addEventListener("click", () => {
      const q = parseQty(input.value, p);
      if (q === null) { err.textContent = qtyError(p); input.focus(); return; }
      err.textContent = "";
      addToBasket(p.id, q);
      add.textContent = "Added ✓";
      setTimeout(() => (add.textContent = "Add to Order"), 1200);
    });

    const body = el("div", { class: "card-body" }, el("h3", {}, p.name), priceEl);
    if (!priced) body.append(el("p", { class: "note" }, "The price must be confirmed with us on WhatsApp before your order is finalised."));
    body.append(
      el("label", { for: "q-" + p.id }, U(p).label),
      el("div", { class: "qty-row" }, el("div", { class: "qty" }, minus, input, plus)),
      err, add
    );
    grid.append(el("article", { class: "card" }, photo, body));
  });
}

// ---- Basket ------------------------------------------------------------
function addToBasket(id, qty) {
  const existing = basket.find((l) => l.id === id);
  if (existing) existing.qty = Math.min(U(find(id)).max, Math.round((existing.qty + qty) * 100) / 100);
  else basket.push({ id, qty });
  renderBasket();
  const pill = $("cartPill");
  pill.classList.remove("bump"); void pill.offsetWidth; pill.classList.add("bump");
}

function lineCost(l) {
  const p = find(l.id);
  return typeof p.price === "number" ? p.price * l.qty : null;
}

function renderBasket() {
  const empty = basket.length === 0;
  $("basketEmpty").hidden = !empty;
  $("basketFilled").hidden = empty;
  const list = $("lines");
  list.textContent = "";
  let subtotal = 0, tbc = [];

  basket.forEach((l) => {
    const p = find(l.id);
    const cost = lineCost(l);
    if (cost === null) tbc.push(p.name); else subtotal += cost;

    const input = el("input", { type: "number", inputmode: "decimal", min: U(p).min, max: U(p).max, step: String(U(p).step), value: String(l.qty), id: "bq-" + l.id, "aria-label": p.name + " quantity in " + U(p).aria });
    const err = el("p", { class: "err", role: "alert" });
    input.addEventListener("change", () => {
      const q = parseQty(input.value, p);
      if (q === null) { err.textContent = qtyError(p); input.value = String(l.qty); return; }
      l.qty = q; renderBasket();
    });
    const remove = el("button", { type: "button", class: "remove" }, "Remove");
    remove.setAttribute("aria-label", "Remove " + p.name + " from order");
    remove.addEventListener("click", () => { basket = basket.filter((x) => x.id !== l.id); renderBasket(); });

    const detail = typeof p.price === "number" ? `${money(p.price)}${U(p).per}` : "Price to be confirmed";
    list.append(el("li", { class: "line" },
      el("div", { class: "line-top" },
        el("div", {}, el("strong", {}, p.name), el("div", { class: "note" }, `${fmtQty(p, l.qty)} · ${detail}`)),
        el("div", { class: "line-cost" }, cost === null ? "To be confirmed" : money(cost))),
      el("div", { class: "qty-row" }, el("label", { for: "bq-" + l.id }, p.unit === "chicken" ? "Number" : "Kg"), input, remove),
      err));
  });

  $("subtotal").textContent = money(subtotal);
  const pill = $("cartPill");
  pill.hidden = empty;
  $("cartCount").textContent = basket.length;
  const note = $("tbcNote");
  note.hidden = tbc.length === 0;
  note.textContent = tbc.length ? `${tbc.join(", ")}: price to be confirmed (not included in the estimate).` : "";
}

// ---- WhatsApp message --------------------------------------------------
function buildMessage(f) {
  const lines = [`Hello ${BUSINESS_NAME}!`, "", "I would like to place an order.", "", `Customer: ${f.name}`];
  if (f.phone) lines.push(`Contact number: ${f.phone}`);
  lines.push(`Fulfilment: ${f.fulfil}`);
  if (f.location) lines.push(`Delivery location: ${f.location}`);
  lines.push("", "Items:");
  let subtotal = 0, tbc = [];
  basket.forEach((l) => {
    const p = find(l.id), cost = lineCost(l);
    if (cost === null) { tbc.push(p.name); lines.push(`- ${p.name}: ${fmtQty(p, l.qty)} - price to be confirmed`); }
    else { subtotal += cost; lines.push(`- ${p.name}: ${fmtQty(p, l.qty)} x ${money(p.price)} = ${money(cost)}`); }
  });
  lines.push("", `Estimated subtotal for priced items: ${money(subtotal)}`);
  const open = tbc.map((n) => n + " price");
  if (f.location) open.push("delivery charge");
  if (open.length) lines.push(`To be confirmed: ${open.join(" and ")}.`);
  if (f.notes) lines.push("", `Notes: ${f.notes}`);
  lines.push("", "Please confirm availability and the final total.");
  return lines.join("\n");
}

// ---- Checkout form -----------------------------------------------------
function setupForm() {
  const form = $("orderForm");
  const locField = $("locField");
  const fulfilValue = () => form.querySelector('input[name="fulfil"]:checked').value;
  const isDelivery = () => fulfilValue() === "Request delivery";

  form.querySelectorAll('input[name="fulfil"]').forEach((r) =>
    r.addEventListener("change", () => { locField.hidden = !isDelivery(); $("locErr").textContent = ""; }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ["nameErr", "phoneErr", "locErr", "formErr"].forEach((id) => ($(id).textContent = ""));
    $("sentMsg").textContent = "";
    const f = {
      name: $("name").value.trim(),
      phone: $("phone").value.trim(),
      fulfil: fulfilValue(),
      location: isDelivery() ? $("location").value.trim() : "",
      notes: $("notes").value.trim()
    };
    let bad = null;
    if (basket.length === 0) { $("formErr").textContent = "Your basket is empty. Add at least one item first."; bad = $("formErr"); }
    if (!f.name) { $("nameErr").textContent = "Please enter your name."; bad = bad || $("name"); }
    if (f.phone && !/^\+?[0-9 ()-]{9,16}$/.test(f.phone)) { $("phoneErr").textContent = "Enter a valid phone number, or leave it blank."; bad = bad || $("phone"); }
    if (isDelivery() && !f.location) { $("locErr").textContent = "Please enter your delivery location."; bad = bad || $("location"); }
    if (bad) { if (bad.focus) bad.focus(); return; }

    const url = waLink(buildMessage(f));
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;   // popup blocked (some mobile browsers)
    $("sentMsg").textContent = "WhatsApp should now be open with your order typed out. Please press Send in WhatsApp. Your order is only confirmed when the shop replies.";
  });
}

// ---- Opening hours (Nairobi time) -------------------------------------
const OPEN_HOUR = 8, CLOSE_HOUR = 23;           // 8:00 a.m. to 11:00 p.m., every day
function setupHours() {
  const el = $("openStatus");
  const update = () => {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === "hour").value) % 24;
    const m = Number(parts.find((p) => p.type === "minute").value);
    const mins = h * 60 + m;
    const open = mins >= OPEN_HOUR * 60 && mins < CLOSE_HOUR * 60;
    el.classList.toggle("open", open);
    el.classList.toggle("closed", !open);
    el.textContent = open ? "Open now, until 11:00 p.m." : "Closed now, opens at 8:00 a.m.";
  };
  try { update(); setInterval(update, 60000); } catch (err) { /* keep the default text */ }
}

// ---- Install as app ----------------------------------------------------
function setupInstall() {
  const help = $("installHelp");
  const standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  const hideAll = () => { ["topBar", "navInstall", "app"].forEach((id) => { $(id).hidden = true; }); };
  if (standalone) { hideAll(); return; }

  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => { hideAll(); });

  const go = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    help.hidden = false;
    help.textContent = ios
      ? "On iPhone: tap the Share button in Safari, then choose Add to Home Screen."
      : "On Android: open your browser menu (the three dots) and choose Install app or Add to Home screen. On a computer, use the install icon in the address bar.";
    $("app").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  ["installBtn", "topInstallBtn", "navInstall"].forEach((id) => $(id).addEventListener("click", go));

  $("topClose").addEventListener("click", () => {
    $("topBar").hidden = true;
    try { sessionStorage.setItem("dennoBar", "1"); } catch (err) { /* ignore */ }
  });
  try { if (sessionStorage.getItem("dennoBar")) $("topBar").hidden = true; } catch (err) { /* ignore */ }

  try {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
  } catch (err) { /* not available here */ }
}

// ---- Motion ------------------------------------------------------------
function setupMotion() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 10), { passive: true });
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const n = e.target;
    n.classList.add("in");
    io.unobserve(n);
    setTimeout(() => { n.classList.remove("reveal", "in"); n.style.transitionDelay = ""; }, 1100);
  }), { threshold: 0.12 });
  document.querySelectorAll(".section h2,.card,.info,.claim,.map-card,#orderForm,#basketEmpty,.steps li,.dark-sec address,.dark-sec .actions,.section .muted").forEach((n) => {
    n.classList.add("reveal");
    const idx = [...n.parentElement.children].indexOf(n);
    n.style.transitionDelay = Math.min(idx, 4) * 90 + "ms";
    io.observe(n);
  });
}

// ---- Page setup --------------------------------------------------------
function init() {
  const hello = waLink(`Hello ${BUSINESS_NAME}! I would like to ask about an order.`);
  ["navWa", "heroWa", "contactWa"].forEach((id) => $(id).setAttribute("href", hello));
  $("year").textContent = new Date().getFullYear();

  const btn = $("menuBtn"), nav = $("nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
  }));

  renderProducts();
  renderBasket();
  setupForm();
  setupMotion();
  setupInstall();
  setupHours();
}
document.addEventListener("DOMContentLoaded", init);
