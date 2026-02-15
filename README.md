# Samen Reisplanner (PWA prototype)

Een modern prototype om met meerdere reizen tegelijk te plannen, inspiratie live op te halen en routepunten op een Google-kaart te tonen.

## Nieuw in deze versie

- **Google Maps integratie** voor bestemming + routepunten.
- **PWA/APP-achtig gedrag** met manifest + service worker, geschikt voor iPhone/Android homescreen.
- **Snelle trip-switch**: bij wisselen van reis wordt alle inhoud (database, route, inspiratie, kaart) direct ververst.
- **Live inspiratie** via actuele bronnen (Wikipedia + Reddit) met fallbacktips.
- **Uitgebreidere reiscategorieën**:
  - Highlights
  - Eten & drinken
  - Hotels & verblijf
  - Cultuur & musea
  - Natuur & strand
  - Kids proof
  - Transport
  - Budget tips

## Lokaal starten

```bash
python3 -m http.server 4173
```

Open daarna:

- `http://localhost:4173`

## Google Maps activeren

1. Maak in Google Cloud een API key voor **Maps JavaScript API** + **Directions API** + **Geocoding API**.
2. Open de app, klap "Google Maps API instellen" open.
3. Plak de key en klik op **Sleutel opslaan**.

> De key wordt alleen lokaal in je browser opgeslagen.

## Belangrijk

- Data staat lokaal op het apparaat (`localStorage`).
- Voor echte realtime samenwerking tussen apparaten is nog een backend nodig.
