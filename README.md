# Samen Reisplanner (PWA prototype)

Een app-achtige reisplanner met aparte pagina's voor Reizen, Database, Routekaart en Inspiratie.

## Nieuw toegevoegd in deze ronde

- **Verplicht inloggen** via `login.html` voordat je de app kunt gebruiken.
- Activiteiten worden nu automatisch gelogd met gebruiker:
  - database-items tonen wie ze heeft toegevoegd
  - routepunten tonen wie ze heeft toegevoegd
  - dagplannerblokken tonen wie ze heeft toegevoegd
- **Stem Als verwijderd**: voting gebruikt automatisch de ingelogde gebruiker.
- **Eigen inspiratie-links bewaren**: voeg handmatig blog/web-links toe per reis en lees ze later terug in een aparte lijst op de inspiratiepagina.

## Bestaande functies

- Slimme dagplanner op `route.html` met waarschuwing bij >180 minuten reistijd per dag.
- Collaborative voting in `database.html` met `Must / Maybe / Skip`.
- Inspiratie quick actions in `inspiratie.html`:
  - Opslaan als database-item in gekozen categorie.
  - Met één klik toevoegen aan route op gekozen dag.
- Losse pagina's voor app-flow:
  - `index.html` → Reizen + reisgenoten
  - `database.html` → categorie-database + voting
  - `route.html` → routepunten + Google Maps + dagplanner
  - `inspiratie.html` → live inspiratiebronnen

## Demo login

- Gebruiker: `jij` — wachtwoord: `reis123`
- Gebruiker: `partner` — wachtwoord: `reis123`

## Lokaal starten

```bash
python3 -m http.server 4173
```

Open daarna `http://localhost:4173` (je wordt doorgestuurd naar login).

## Google Maps activeren

1. Maak een API key in Google Cloud.
2. Zet **Maps JavaScript API**, **Directions API** en **Geocoding API** aan.
3. Open `route.html`, vul de key in en klik op **Sleutel opslaan**.

## GitHub Pages: oude versie oplossen

Zie je online nog een oude versie na een nieuwe merge? Doe dan dit:

1. Ga naar **Settings → Pages** en controleer:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
2. Wacht tot de nieuwste deployment op **Actions** groen is.
3. Open de site 1x in een incognito venster of doe een harde refresh (`Ctrl+F5` / `Cmd+Shift+R`).
4. Zie je nog steeds oud scherm? Open browser DevTools → Application/Storage en verwijder **Site data** één keer voor deze URL.

De service worker gebruikt nu network-first voor lokale bestanden (HTML/JS/CSS), zodat nieuwe deploys sneller zichtbaar worden.

## Let op

- Dit is een client-side auth-prototype (geen server-side beveiliging).
- Data is lokaal per apparaat/browser (`localStorage`).
- Voor echte multi-device realtime samenwerking is backend/sync nodig.
