// Pas deze gegevens aan — ze worden overal op de pagina ingevuld.
const CONFIG = {
  email: "info@voltragroup.be",
  phone: "0489 41 35 89",
  whatsapp: "32489413589", // internationaal formaat, zonder + of spaties
};

// Postcodes binnen het vaste werkgebied (Antwerpen en de rand).
// Houd gelijk met de .towns-lijst en areaServed in index.html en met llms.txt.
const SERVICE_ZIPS = {
  "2000": "Antwerpen", "2018": "Antwerpen", "2020": "Antwerpen", "2030": "Antwerpen", "2040": "Antwerpen (Berendrecht/Zandvliet/Lillo)",
  "2050": "Antwerpen Linkeroever", "2060": "Antwerpen", "2070": "Zwijndrecht/Burcht",
  "2100": "Deurne", "2140": "Borgerhout", "2170": "Merksem", "2180": "Ekeren",
  "2600": "Berchem", "2610": "Wilrijk", "2660": "Hoboken", "2640": "Mortsel", "2650": "Edegem",
  "2550": "Kontich", "2530": "Boechout", "2160": "Wommelgem", "2900": "Schoten", "2970": "Schilde",
  "2930": "Brasschaat", "2950": "Kapellen", "2150": "Borsbeek", "2540": "Hove", "2520": "Ranst",
  "2627": "Schelle", "2630": "Aartselaar", "2620": "Hemiksem",
};

const $ = (s, el = document) => el.querySelector(s);

// Contactgegevens invullen (ook op subpagina's; elke lookup mag ontbreken)
document.querySelectorAll("[data-email]").forEach((a) => { a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Vraag via racehouse.be")}`; a.textContent = CONFIG.email; });
document.querySelectorAll("[data-phone]").forEach((a) => { a.href = `tel:+32${CONFIG.phone.replace(/\s/g, "").replace(/^0/, "")}`; a.textContent = CONFIG.phone; });
document.querySelectorAll("[data-whatsapp]").forEach((a) => { a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hallo Racehouse, ")}`; });
const yearEl = $("#year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobiel menu (≤960px)
const nav = $(".nav"), toggle = $(".nav__toggle");
const setMenu = (open) => { nav?.classList.toggle("is-open", open); toggle?.setAttribute("aria-expanded", String(open)); };
toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
$("#menu")?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav?.classList.contains("is-open")) { setMenu(false); toggle?.focus(); } });
document.addEventListener("click", (e) => { if (nav?.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false); });

// Toerenteller-schaalverdeling
(() => {
  const g = $(".gauge__ticks");
  if (!g) return;
  const ns = "http://www.w3.org/2000/svg";
  const total = 40;
  for (let i = 0; i <= total; i++) {
    const angle = (-225 + (270 * i) / total) * (Math.PI / 180);
    const major = i % 5 === 0;
    const r1 = major ? 140 : 148;
    const r2 = 156;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", 200 + r1 * Math.cos(angle));
    line.setAttribute("y1", 200 + r1 * Math.sin(angle));
    line.setAttribute("x2", 200 + r2 * Math.cos(angle));
    line.setAttribute("y2", 200 + r2 * Math.sin(angle));
    if (major) line.classList.add("major");
    if (i >= 30) line.classList.add("red");
    g.appendChild(line);
  }
})();

// Bewegende band pauzeren
const st = $(".strip__toggle");
st?.addEventListener("click", () => { const p = $(".strip-wrap").classList.toggle("is-paused"); st.setAttribute("aria-pressed", String(p)); });

// Postcodecheck
function zoneFor(zip) {
  if (!/^\d{4}$/.test(zip)) return { cls: "", msg: "Geef een geldige Belgische postcode in (4 cijfers)." };
  if (SERVICE_ZIPS[zip]) return { cls: "ok", msg: `✓ ${SERVICE_ZIPS[zip]} ligt in ons werkgebied.` };
  const n = Number(zip);
  if ((n >= 2000 && n <= 2999) || (n >= 9100 && n <= 9190)) {
    return { cls: "maybe", msg: "Net buiten onze vaste zone — stuur een aanvraag, vaak lukt het toch (mogelijk met kleine verplaatsingskost)." };
  }
  return { cls: "", msg: "Dit valt buiten ons werkgebied, maar contacteer ons gerust voor de mogelijkheden." };
}

// Zone-hint onder de postcode in het afsprakenformulier
const formZip = $("#f-zip");
function showZone() {
  const hint = $("#f-zip-zone");
  if (!formZip || !hint) return;
  const zip = formZip.value.trim();
  hint.textContent = /^\d{4}$/.test(zip) ? zoneFor(zip).msg : "";
}
// Tijdens het typen tonen (niet pas bij "change"): anders verspringt het formulier net wanneer je een keuzechip aantikt
formZip?.addEventListener("input", showZone);
formZip?.addEventListener("change", showZone);

$("#zip-check")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("#zip-result");
  const zip = $("#zip-input").value.trim();
  const { cls, msg } = zoneFor(zip);
  out.className = `zip__result ${cls}`;
  out.textContent = msg;
  // Binnen of net buiten de zone: postcode alvast invullen en doorverwijzen naar het formulier
  if (cls === "ok" || cls === "maybe") {
    if (formZip && !formZip.value) { formZip.value = zip; showZone(); }
    const next = document.createElement("a");
    next.href = "#afspraak";
    next.className = "zip__next";
    next.textContent = "Vraag je afspraak aan ";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    next.append(arrow);
    out.append(" ", next);
  }
});

// Afspraakformulier: stelt een bericht op en opent e-mail of WhatsApp
const form = $("#booking-form");

const RULES = {
  naam: [(v) => v.length > 0, "Vul je naam in."],
  telefoon: [(v) => v.replace(/\D/g, "").length >= 9, "Vul een telefoonnummer in waarop we je kunnen bereiken."],
  motor: [(v) => v.length > 0, "Vul merk en model van je motor in."],
  postcode: [(v) => /^\d{4}$/.test(v), "Vul je postcode in (4 cijfers)."],
};
function validate(el) {
  const rule = RULES[el.name]; if (!rule) return true;
  const ok = rule[0](el.value.trim());
  el.setAttribute("aria-invalid", String(!ok));
  const err = document.getElementById(el.id + "-err"); if (err) err.textContent = ok ? "" : rule[1];
  return ok;
}

// Oudere Safari kent e.submitter niet: onthoud welke knop werd gebruikt
let lastVia = "email";
form?.querySelectorAll("[data-send]").forEach((b) => b.addEventListener("click", () => { lastVia = b.dataset.send; }));

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const status = $("#form-status");
  const via = e.submitter?.dataset.send || lastVia;

  const invalid = [...form.querySelectorAll("[required]")].filter((el) => !validate(el));
  if (invalid.length) {
    status.className = "form__status error";
    status.textContent = `Nog niet compleet: ${invalid.map((el) => el.labels[0].textContent.trim().toLowerCase()).join(", ")}.`;
    invalid[0].focus();
    return;
  }

  const data = new FormData(form);
  const services = data.getAll("dienst");
  const lines = [
    `Naam: ${data.get("naam")}`,
    `Telefoon: ${data.get("telefoon")}`,
    `Motor: ${data.get("motor")}`,
    `Postcode: ${data.get("postcode")}`,
    `Diensten: ${services.length ? services.join(", ") : "nog niet gekozen"}`,
  ];
  if (data.get("bericht").trim()) lines.push("", data.get("bericht").trim());
  const text = lines.join("\n");

  const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Afspraakaanvraag Racehouse\n\n${text}`)}`;
  const mailUrl = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Racehouse – afspraakaanvraag – ${data.get("motor")}`)}&body=${encodeURIComponent(text.replace(/\n/g, "\r\n"))}`;

  if (via === "whatsapp") {
    window.open(waUrl, "_blank", "noopener");
  } else {
    window.location.href = mailUrl;
  }
  // Geen succesmelding: we weten niet of er effectief iets verstuurd werd
  status.className = "form__status ok";
  status.textContent = via === "whatsapp"
    ? "WhatsApp zou nu moeten openen met je aanvraag. Druk daar nog op Verzenden."
    : "Je e-mailprogramma zou nu moeten openen met je aanvraag. Druk daar nog op Verzenden.";

  // Terugvaloptie tonen: aanvraag kopiëren of opnieuw openen
  const copy = $("#form-copy"), re = $("#reopen-link"), copyBtn = $("#copy-btn"), fallback = $("#form-fallback");
  if (copy) copy.value = text;
  if (copyBtn) copyBtn.textContent = "Kopieer aanvraag";
  if (re) {
    re.href = via === "whatsapp" ? waUrl : mailUrl;
    if (via === "whatsapp") { re.target = "_blank"; re.rel = "noopener"; } else { re.removeAttribute("target"); re.removeAttribute("rel"); }
  }
  if (fallback) fallback.hidden = false;
});

// Fouten verdwijnen tijdens het typen, maar pas na een eerste mislukte poging
form?.addEventListener("input", (e) => {
  if (e.target.getAttribute("aria-invalid") === "true") validate(e.target);
});

$("#copy-btn")?.addEventListener("click", async (e) => {
  const btn = e.currentTarget; // na await is e.currentTarget leeg
  const ta = $("#form-copy");
  try {
    await navigator.clipboard.writeText(ta.value);
    btn.textContent = "Gekopieerd ✓";
  } catch {
    ta.focus();
    ta.select();
    const status = $("#form-status");
    status.className = "form__status";
    status.textContent = "Kopiëren lukte niet automatisch. De tekst is geselecteerd: kopieer hem met Ctrl+C of lang drukken.";
  }
});

// Menu sluiten als het venster breder wordt dan de mobiele weergave
matchMedia("(min-width: 961px)").addEventListener?.("change", (e) => { if (e.matches) setMenu(false); });
