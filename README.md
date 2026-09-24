# Thai Smile Delft — redesign preview

Mobile-first redesign voor Thai Smile in Delft, opgezet voor **Pages CMS → GitHub main → Vercel**.

## Inhoud & CMS
- `data/site.json` — hero, bedrijfsgegevens, contact, openingstijden, Over de salon, afbeeldingen, galerij, reviews, socials en SEO.
- `data/treatments.json` — behandelingen, uitgebreide uitleg, actief/inactief en per duur een prijsveld.
- `data/packages.json` — cadeaubonnen/pakketten.
- `data/legal.json` — algemene voorwaarden, privacy, afspraken/annuleren en bedrijfsgegevens.
- `.pages.yml` — Pages CMS configuratie.
- `build.js` — genereert SEO metadata, JSON-LD, robots en sitemap en kopieert de site naar `dist/`.

## Build
```bash
npm run build
```
Vercel gebruikt `node build.js` en publiceert `dist/`.

## Belangrijke checks vóór livegang
1. **Openingstijden:** eigen website vermeldt ma–za 09:00–20:00; de actuele openbare Google-bedrijfsvermelding toont ma–za 09:00–22:00. Eerst met de salon bevestigen.
2. **Prijzen:** de huidige prijslijst staat als afbeelding op de oude site. Bedragen zijn daarom bewust niet verzonnen; alle prijsvelden staan leeg in het CMS.
3. **E-mail/socials:** niet betrouwbaar op de primaire site gevonden en daarom leeg gelaten.
4. **Afbeeldingen:** de preview gebruikt de gecontroleerde publieke bronbestanden. Voor productie de originele bestanden lokaal opslaan in `assets/images/` en via Pages CMS vervangen.
5. **BMS:** de bestaande site noemt BMS. Controleer de actuele formulering/lidmaatschapsstatus voordat dit prominenter als keurmerk wordt ingezet.
6. **Domein:** `thai-smile.nl` niet omzetten voordat bovenstaande punten zijn bevestigd en de preview door de klant is goedgekeurd.
