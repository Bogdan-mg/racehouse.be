# racehouse.be

Website voor Racehouse — mobiele motormechanieker aan huis in Antwerpen en omgeving.

Statische site zonder build-stap: `index.html`, `styles.css`, `script.js`.

## Lokaal bekijken

```sh
python3 -m http.server 8000
```

Open daarna http://localhost:8000.

## Aanpassen

- **Contactgegevens**: bovenaan `script.js` (`CONFIG`) én in `index.html` (JSON-LD, footer, BTW-nummer).
- **Werkgebied**: lijst `SERVICE_ZIPS` in `script.js` en de gemeenten in `index.html`.
- **Uren**: sectie `#afspraak` en `openingHoursSpecification` in `index.html`.

## Hosten

Werkt rechtstreeks op Netlify, Vercel, Cloudflare Pages of GitHub Pages — publiceer de map zoals hij is.
