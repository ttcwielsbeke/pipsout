# PIPS OUT! — TTC Wielsbeke-Spotit

> *"Bestuur van TTC Wielsbeke-Spotit introduceert videogame die de politieke agenda van de club in de verf moet zetten."*
> — Wielsbeke nieuwsflits

De Facebookgrap, maar dan echt. Pop alle noppen van je rubber voor de klok af is.
Elk blad heeft kleinere noppen en meer van het spul.

## Spelen

Open `index.html`, of speel online (GitHub Pages, zie onder).

- **Klikken of vegen** over de noppen om ze te poppen. Snel na elkaar = combo tot ×8.
- 🟡 **Gouden nop** — +3 seconden.
- 🟠 **Lijmnop** — ontploft en sleurt de buren mee.
- ⚫ **Anti-topspin nop** — níet aanraken, −3 seconden en je combo is weg.
- Rubber leeg vóór de klok af is → volgend blad. Klok op nul → een hartje minder. Drie hartjes en het is gedaan.

Je kan je rubberkleur kiezen op het titelscherm: rood, zwart, groen, blauw, roze en paars —
de kleuren die sinds de ITTF-regelwijziging van 2021 effectief te koop zijn bij korte noppen.
De keuze wordt onthouden, net als je clubrecord (`localStorage`).

## Technisch

Drie bestanden, geen build, geen dependencies, geen server, geen assets.

| bestand | inhoud |
|---|---|
| `index.html` | HUD, overlays, ticker |
| `style.css` | de pixel-arcade skin |
| `game.js` | canvas-render, noppenraster, geluid |

- Het blad is een hexagonaal noppenraster binnen een cirkel; noppengrootte per level in `PIP_SIZES`.
- Alle geluid is gesynthetiseerd met de Web Audio API — er staat geen enkel `.mp3` in deze repo.
- De rubberkleuren staan in de `RUBBERS`-array in [`game.js`](game.js). Een kleur bijzetten is
  één object: `rubber` (het vlak), `pip` (de nop), `hole` (het gat), `dead` (de anti-topspin nop), `crumb` (de kruimels).

## Lokaal draaien

```bash
python -m http.server 8123
```

Dan naar <http://localhost:8123>. (`index.html` rechtstreeks openen werkt ook.)

## Hosten op GitHub Pages

```bash
git remote add origin https://github.com/<gebruiker>/<repo>.git
git push -u origin main
```

Daarna in de repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
Na een minuutje staat het spel op `https://<gebruiker>.github.io/<repo>/`.

Voor de volle grap: maak de repo `<clubnaam>.github.io`, dan is het gewoon
`https://<clubnaam>.github.io/` — een gratis .io-domein.
