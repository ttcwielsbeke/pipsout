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

Na afloop zet je je naam bij je score en kom je in de **erelijst**: één gedeelde
ranglijst voor heel de club. Per naam blijft enkel de beste score staan. Ligt de
verbinding plat, dan wordt je score op je eigen toestel bewaard en zie je de lijst
van dat toestel.

Je kan je rubberkleur kiezen op het titelscherm: rood, zwart, groen, blauw, roze en paars —
de kleuren die sinds de ITTF-regelwijziging van 2021 effectief te koop zijn bij korte noppen.
De keuze wordt onthouden, net als je clubrecord (`localStorage`).

## Technisch

Drie bestanden, geen build, geen dependencies, geen server, geen assets.

| bestand | inhoud |
|---|---|
| `index.html` | HUD, overlays, ticker, og-tags |
| `style.css` | de pixel-arcade skin |
| `game.js` | canvas-render, noppenraster, geluid |
| `board.js` | de erelijst (Supabase, met localStorage als vangnet) |
| `config.js` | de sleutels voor de clubranking |
| `og.jpg` | 1200×630 kaart voor de link-preview |
| `logo.svg` | het batje als vector — bron voor het GitHub-logo |
| `logo.png` | 512×512, klaar om te uploaden |
| `tools/og.html` | generator die die kaart opnieuw maakt |
| `tools/logo.html` | zet `logo.svg` om in `logo.png` |

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

Deze repo staat op <https://github.com/ttcwielsbeke/pipsout>.

Eenmalig aanzetten: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**
(<https://github.com/ttcwielsbeke/pipsout/settings/pages>).

Een minuutje later staat het spel op **<https://ttcwielsbeke.github.io/pipsout/>** —
een gratis .io-domein op naam van de club, precies zoals de nieuwsflits beloofde.

Vanaf dan is elke `git push` naar `main` meteen een release. Er is geen build,
dus wat in de repo staat, is wat er online staat.

## Het logo

`logo.svg` is het clubbatje natekend in vectorvorm: cirkels, rechthoeken en één boog,
geen lettertype en geen ingebedde afbeelding. Daardoor is elke maat scherp — van de
460 pixels op een GitHub-profiel tot de 20 pixels naast een commit.

Het vierkant is opgebouwd voor de ronde uitsnede die GitHub eroverheen legt: het batje
staat op de diagonaal en de drie clubkleuren lopen vol over de breedte, zodat de cirkel
er niets van afsnijdt dat ertoe doet.

Uploaden: **Settings → Profile → Picture** (of **Organization → Settings → Profile**)
en kies `logo.png`.

Opnieuw maken na een aanpassing aan `logo.svg`:

```bash
python tools/ogsave.py     # schrijft binnenkomende PNG naar de repo
python -m http.server 8123 # en in een tweede terminal
```

Dan naar <http://localhost:8123/tools/logo.html>. De pagina toont het logo op alle
maten die GitHub gebruikt en schrijft meteen de nieuwe `logo.png` weg.

## Op de clubwebsite zetten

Voor wie de spelletjespagina bouwt: een kaartje dat doorlinkt volstaat. Alles hieronder
is publiek en heeft geen sleutel nodig.

| veld | waarde |
|---|---|
| titel | PIPS OUT! |
| ondertitel | Het officiële videospel van TTC Wielsbeke-Spotit |
| omschrijving | Pop élke nop van je rubber voor de klok af is. |
| afbeelding | `https://ttcwielsbeke.github.io/pipsout/og.jpg` (1200×630, jpeg) |
| link | `https://ttcwielsbeke.github.io/pipsout/` |

Het spel opent gewoon in een nieuw tabblad en past zich aan gsm en laptop aan.

## De clubranking aanzetten

De ranglijst draait op de gratis laag van [Supabase](https://supabase.com). Zolang
`config.js` geen sleutels bevat, valt het spel vanzelf terug op een lijst per toestel —
er gaat dus niets stuk zolang dit niet ingesteld is.

**1. Maak een project** op supabase.com (gratis, geen kaart nodig).

**2. Plak dit in de SQL Editor** en voer het uit:

```sql
create table public.scores (
  id         bigint generated always as identity primary key,
  name       text        not null,
  score      integer     not null,
  level      integer     not null,
  ts         bigint      not null,
  created_at timestamptz not null default now()
);

create index scores_score_idx on public.scores (score desc);

alter table public.scores enable row level security;

-- iedereen mag de ranglijst lezen
create policy "ranglijst lezen"
  on public.scores for select to anon
  using (true);

-- iedereen mag een score toevoegen, maar geen onzin
create policy "score toevoegen"
  on public.scores for insert to anon
  with check (
    char_length(btrim(name)) between 1 and 16
    and level between 1 and 99
    and score >= 0
    and score <= 30000 * level * (level + 1)
  );
```

Er staat bewust **geen** update- of delete-policy: bezoekers kunnen scores toevoegen
en lezen, maar niets wijzigen of wissen. De bovengrens op `score` is dezelfde als in
`board.js`: ruim het dubbele van wat een perfect gespeeld blad kan opleveren, zodat een
uitzonderlijke partij nooit geweigerd wordt maar `9999999` wel.

**3. Settings → API**, kopieer de *Project URL* en de *anon public* key naar `config.js`:

```js
provider: 'supabase',
url: 'https://xxxxxxxx.supabase.co',
key: 'eyJhbGciOi...'
```

Die anon key hoort publiek te zijn — dat is waar hij voor dient. De echte beveiliging
zit in de policies hierboven, niet in het geheimhouden van de sleutel. De `service_role`
key hoort hier nooit in.

**4. Pushen.** Klaar.

Eén ding om te weten: dit blijft een spel dat volledig in de browser draait, dus wie
zijn console opendoet, kan een score verzinnen binnen die grenzen. Voor een clubranking
is dat prima — en het wordt vanzelf de volgende running gag.

## De link-preview opnieuw maken

`og.jpg` is geen screenshot: `tools/og.html` laadt het echte spel in een iframe, popt
een handvol noppen, en tekent dat samen met het logo in een kaart van 1200×630. Zo
blijft de afbeelding automatisch kloppen als het blad er anders gaat uitzien.

```bash
python tools/ogsave.py     # schrijft binnenkomende PNG/JPEG naar de repo
python -m http.server 8123 # en in een tweede terminal
```

Open dan <http://localhost:8123/tools/og.html>. De pagina tekent zichzelf en post het
resultaat als `og.jpg`. Daarna committen en pushen; Facebook haalt de nieuwe versie op
via <https://developers.facebook.com/tools/debug/> → **Scrape Again**.
