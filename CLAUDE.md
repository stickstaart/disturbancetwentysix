# Disturbance – website + band-agenda

Overdracht voor Claude-sessies. Lees dit eerst. Bijgewerkt: 27 oktober 2026.

## Werkafspraken
- Antwoord in het **Nederlands**; Engelse vaktermen zijn prima.
- Joz pusht zelf via **GitKraken** (remote is SSH). Claude commit lokaal, pusht nooit.
- Commits: auteur `JØƵ <jos@tharonline.nl>` (in de VM: `git -c user.name=… -c user.email=… commit`).
- In de Cowork-VM: vraag **eerst** verwijderrecht aan vóór git-operaties (anders blijven `.git/*.lock` hangen en lopen checkout/merge half vast).
- npm-installs werken niet vanuit de VM (403). Liever geen nieuwe dependencies; serverfuncties gebruiken alleen `fetch` / `node:crypto`.
- Testfase: nog **geen** aparte inlogs per bandlid bouwen tot Joz het zegt (zie "Open").

## Stack
- Vite + React 19 + TypeScript + Tailwind v4, react-router-dom.
- Firebase Firestore, project **`disturbance-wpa`** ("Disturbance WPA"). Het andere project `enticx-go-clone` is oud/ongebruikt.
- Vercel, team **StickStaart DEV** (Hobby), project **`disturbanceofficial`**. `.vercel/project.json` verwijst nog naar een oud project – niet gebruiken.
- Preview van de agenda-branch: https://disturbanceofficial-git-agenda-firestore-stickstaartdev.vercel.app/agenda

## Branches
- `main` – live site (homepage).
- `agenda-firestore` – band-agenda op `/agenda` + Stats-tab. Nog **niet** gemerged.

## Structuur
- `src/components/Home.tsx` e.a. – publieke site. `useScrollGlow` + `.glow-line` (index.css) voor de gifgroene lijnen.
- `src/components/BandDashboard.tsx` – agenda (tabs Agenda / Tour-ideeën / Stats). Toegang nu via één gedeeld wachtwoord + gekozen bandlid in localStorage (tijdelijk).
- `src/components/dashboard/*` – ShowCard/ShowForm/IdeaCard/IdeaForm, CustomDatePicker, CountryFlag (+ UnavailableFlag), StatsPanel.
- `src/lib/agendaStore.ts` – Firestore-collecties `shows`, `tourIdeas`, `publicShows` (audit-velden, `isDummy`); `testMode.ts`, `dummyData.ts`, `useSiteShows.ts`.
- `src/lib/outbound.ts` + `GoRedirect.tsx` – uitgaande links via `/go/<dienst>/<item>?to=<url>` (host-allowlist), zodat Vercel Analytics doorkliks per dienst/land telt.
- `api/stats.ts` – `?range=30d` live uit Vercel Web Analytics API; `?range=12m|all` opgeteld uit Firestore `statsDaily`.
- `api/stats-snapshot.ts` – Vercel Cron (`vercel.json`, dagelijks 04:20 UTC): bewaart dagcijfers in `statsDaily/{YYYY-MM-DD}`, vult tot 29 dagen terug aan. Alleen op Production.
- `api/_lib/analytics.ts` (Vercel API), `api/_lib/firestore.ts` (Firestore REST met service-account-JWT, geen firebase-admin).

## Environment Variables (Vercel, projectniveau)
- `STATS_VERCEL_TOKEN`, `STATS_TEAM_ID` – Production + Preview. Project-ID komt automatisch uit `VERCEL_PROJECT_ID` (`STATS_PROJECT_ID` is overbodig).
- `FIREBASE_SERVICE_ACCOUNT` – service-account JSON van `disturbance-wpa`, Production + Preview (Sensitive).
- `CRON_SECRET` – Production.
- Na het wijzigen van variabelen: **Redeploy van de juiste deployment** (die van de branch/commit, niet een oudere).
- Web Analytics is aangezet op 26 oktober 2026; daarvóór is er geen data.

## Status (27 okt 2026)
- Stats-tab werkt op de preview (30 dagen / 12 maanden / altijd).
- Lokaal (`npm run dev`) toont Stats voorbeelddata: `/api` draait alleen op Vercel.

## Open – in deze volgorde
1. **Stats-basis naar `main`** (api/, vercel.json-cron, /go-links in Footer/Discography, GoRedirect-route) zonder de agenda-UI, **vóór ±23 november 2026** – anders vallen de eerste dagen buiten Vercels 30-dagenvenster. Daarna in Vercel → Cron Jobs → Run om te testen.
2. **Inlogs per bandlid** (Firebase Auth) + strakke Firestore-regels, **vóór 31 december 2026** (dan lopen de huidige testregels af). Preview-domein toevoegen aan Firebase Auth → Authorized domains.
3. Band test UX/UI op de preview.
4. `agenda-firestore` naar `main` als iedereen akkoord is.
- Later/optioneel: PWA.
