# Samen Reisplanner (prototype)

Een simpele webapp om samen reizen te plannen. Je kunt meerdere reizen bijhouden, ideeën opslaan per categorie en een route maken.

## Wat je al kunt

- Meerdere reizen aanmaken en wisselen tussen reizen.
- Per reis reisgenoten toevoegen.
- Dingen opslaan in categorieën:
  - Stad
  - Eten
  - Museum
  - Hotel
  - Activiteit
- Routeplanning opbouwen met dag, stop en tijd.
- Inspiratiesectie met wisselende voorbeelditems:
  - Persoonlijke gezinsblogs
  - Trending Insta/TikTok-achtige onderwerpen

> Alle data wordt lokaal opgeslagen in je eigen browser (`localStorage`).

---

## Waar kan ik dit nu openen en gebruiken?

Je hebt 2 makkelijke opties:

## Optie A (snelste): lokaal op je eigen computer openen

### 1) Download de code
- Als je al een kopie hebt van deze map: ga door naar stap 2.
- Via GitHub: klik op **Code** → **Download ZIP** → pak het ZIP-bestand uit.

### 2) Open de app
- Ga naar de uitgepakte map.
- Dubbelklik op `index.html`.

Dat is genoeg om de app te gebruiken.

### 3) Beter alternatief met lokale server (aanrader)
Sommige browsers werken stabieler met een lokale server.

Open Terminal in de projectmap en run:

```bash
python3 -m http.server 4173
```

Open daarna in je browser:

- `http://localhost:4173`

---

## Optie B: online gebruiken via GitHub Pages

Als je de app online wil openen (ook op telefoon), gebruik GitHub Pages:

1. Push deze repository naar je GitHub account.
2. Open op GitHub: **Settings** → **Pages**.
3. Bij **Source** kies je:
   - Branch: `main` (of jouw branch)
   - Folder: `/ (root)`
4. Klik **Save**.
5. Na ~1 minuut krijg je een URL zoals:
   - `https://jouw-gebruikersnaam.github.io/Travelapp/`

Vanaf dan kun je de app via die link openen.

---

## Belangrijk om te weten (voor samenwerken)

Nu staat alle data alleen in de browser van degene die de app opent. Dus:

- Jij en je vrouw zien **niet automatisch dezelfde data** als jullie op verschillende apparaten zitten.
- Voor échte realtime samenwerking is een backend nodig (database + login + sync).

---

## Logische volgende stappen voor een echte online versie

1. **Inloggen + gedeelde data**
   - Backend met gebruikersaccounts (bijv. Supabase/Firebase/Postgres + API).
   - Rechten per reis (jij + je vrouw + evt. anderen).
2. **Realtime samenwerken**
   - Live updates via websockets/realtime database.
3. **Echte inspiratiebronnen koppelen**
   - Blogfeeds (RSS/API) op bestemming filteren.
   - Social trend data via beschikbare APIs.
4. **Slim routeplan**
   - Kaartintegratie (Google Maps/Mapbox/OpenStreetMap).
   - Optimalisatie op reistijd/openingstijden.
