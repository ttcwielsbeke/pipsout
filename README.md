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

Deze repo staat op <https://github.com/boermansjo/pipsout>.

Eenmalig aanzetten: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**
(<https://github.com/boermansjo/pipsout/settings/pages>).

Een minuutje later staat het spel op **<https://boermansjo.github.io/pipsout/>** —
een gratis .io-domein, precies zoals de nieuwsflits beloofde.

Vanaf dan is elke `git push` naar `main` meteen een release. Er is geen build,
dus wat in de repo staat, is wat er online staat.
