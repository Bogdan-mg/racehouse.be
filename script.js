// Pas deze gegevens aan — ze worden overal op de pagina ingevuld.
const CONFIG = {
  email: "giurgeab@gmail.com",
  phone: "+32 400 00 00 00",
  whatsapp: "32400000000", // internationaal formaat, zonder + of spaties
};

// Postcodes binnen het vaste werkgebied (Antwerpen en de rand).
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

// Contactgegevens invullen
document.querySelectorAll("[data-email]").forEach((a) => { a.href = `mailto:${CONFIG.email}`; a.textContent = CONFIG.email; });
document.querySelectorAll("[data-phone]").forEach((a) => { a.href = `tel:${CONFIG.phone.replace(/\s/g, "")}`; a.textContent = CONFIG.phone; });
document.querySelectorAll("[data-whatsapp]").forEach((a) => { a.href = `https://wa.me/${CONFIG.whatsapp}`; });
$("#year").textContent = new Date().getFullYear();

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

$("#zip-check")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const out = $("#zip-result");
  const { cls, msg } = zoneFor($("#zip-input").value.trim());
  out.className = `zip__result ${cls}`;
  out.textContent = msg;
});

// Afspraakformulier: stelt een bericht op en opent e-mail of WhatsApp
const form = $("#booking-form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const status = $("#form-status");
  const via = e.submitter?.dataset.send || "email";

  let firstInvalid = null;
  form.querySelectorAll("[required]").forEach((el) => {
    const bad = !el.value.trim();
    el.setAttribute("aria-invalid", bad);
    if (bad && !firstInvalid) firstInvalid = el;
  });
  if (firstInvalid) {
    status.className = "form__status error";
    status.textContent = "Vul je naam, telefoon, motor en postcode in.";
    firstInvalid.focus();
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

  if (via === "whatsapp") {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Afspraakaanvraag Racehouse\n\n${text}`)}`, "_blank", "noopener");
  } else {
    const subject = `Afspraakaanvraag — ${data.get("motor")}`;
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }
  status.className = "form__status ok";
  status.textContent = "Je bericht staat klaar — verstuur het in je e-mail of WhatsApp. We antwoorden snel!";
});

form?.addEventListener("input", (e) => {
  if (e.target.hasAttribute("aria-invalid") && e.target.value.trim()) e.target.setAttribute("aria-invalid", "false");
});
