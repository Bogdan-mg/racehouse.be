# racehouse.be

Website voor Racehouse — mobiele motormechanieker aan huis in Antwerpen en omgeving.

Statische site zonder build-stap: `index.html`, `styles.css`, `script.js`.

Overige bestanden:

- `privacy.html` — privacybeleid (gelinkt vanuit de footer en het formulier).
- `404.html` — eigen foutpagina; Vercel toont ze automatisch bij een onbekende URL.
- `vercel.json` — beveiligingsheaders (o.a. Content-Security-Policy) en lange cache voor de lettertypes.
- `llms.txt` — korte, feitelijke samenvatting voor AI-assistenten.
- `assets/fonts/` — zelf gehoste lettertypes (Barlow Condensed, Inter, Montserrat; SIL OFL 1.1).
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `og-image.png`, `robots.txt`, `sitemap.xml`.

## Lokaal bekijken

```sh
python3 -m http.server 8000
```

Open daarna http://localhost:8000.

## Lokaal testen

- De pagina's gebruiken root-absolute paden (`/styles.css`, `/privacy.html`), dus open ze via de lokale server en niet als bestand.
- De 404-pagina open je lokaal rechtstreeks als http://localhost:8000/404.html (de Python-server toont zelf geen eigen 404).
- De Content-Security-Policy uit `vercel.json` geldt pas op Vercel. Voeg geen inline `<style>`, `style="…"`, inline `<script>` of `on…`-attributen toe; die worden daar geblokkeerd.

## Aanpassen

- **Contactgegevens**: bovenaan `script.js` (`CONFIG`) én in `index.html` (JSON-LD, footer), `privacy.html`, `404.html` en `llms.txt`.
- **Werkgebied**: staat op vier plaatsen die gelijk moeten blijven:
  1. `SERVICE_ZIPS` in `script.js` (postcodecheck),
  2. de lijst `.towns` in `index.html`,
  3. `areaServed` in de JSON-LD in `index.html`,
  4. de sectie Werkgebied in `llms.txt`.
- **Uren**: sectie `#afspraak` en `openingHoursSpecification` in `index.html`, en `llms.txt`.

## Hosten

Werkt rechtstreeks op Netlify, Vercel, Cloudflare Pages of GitHub Pages — publiceer de map zoals hij is. `vercel.json` wordt alleen door Vercel gebruikt.
