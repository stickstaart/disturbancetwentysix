# Disturbance – website + band-agenda

Overdracht voor Claude-sessies. Lees dit eerst. Bijgewerkt: 31 oktober 2026.

## Werkafspraken
- Antwoord in het **Nederlands**; Engelse vaktermen zijn prima.
- Joz pusht zelf via **GitKraken** (remote is SSH). Claude commit lokaal, pusht nooit.
- Commits: auteur `JØƵ <jos@tharonline.nl>` (in de VM: `git -c user.name=… -c user.email=… commit`).
- In de Cowork-VM: vraag **eerst** verwijderrecht aan vóór git-operaties (anders blijven `.git/*.lock` hangen en lopen checkout/merge half vast).
- npm-installs werken niet vanuit de VM (403). Liever geen nieuwe dependencies; serverfuncties gebruiken alleen `fetch` / `node:crypto`.

## Stack
- Vite + React 19 + TypeScript + Tailwind v4, react-router-dom.
- Firebase Firestore, project **`disturbance-wpa`** ("Disturbance WPA"). Het andere project `enticx-go-clone` is oud/ongebruikt.
- Vercel, team **StickStaart DEV** (Hobby), project **`disturbanceofficial`**. `.vercel/project.json` verwijst nog naar een oud project – niet gebruiken.
- Live: https://disturbance.nl/agenda (sinds 31 okt 2026). Unieke preview-URL's per deployment kunnen niet inloggen (niet in Authorized domains); voor UI-tests is dat geen probleem.

## Branches
- `main` – live site, inclusief de agenda. Alles wat naar `main` gepusht wordt gaat live.
- Werk per onderwerp op een nieuwe branch vanaf `main`; merge via fast-forward in GitKraken.
- `BannerSlider` – geparkeerd idee: zelf ontworpen banners in een carrousel op de homepage.

## Structuur
- `src/components/Home.tsx` e.a. – publieke site. `useScrollGlow` + `.glow-line` (index.css) voor de gifgroene lijnen.
- `src/components/BandDashboard.tsx` – agenda (tabs Agenda / Tour-ideeën / Stats). Inloggen met Google (Firebase Auth) via `src/lib/bandAuth.ts`: alleen de vier e-mailadressen in `MEMBER_BY_EMAIL`. Joz (superadmin) kan in Instellingen tijdelijk als ander bandlid werken.
- `src/components/dashboard/*` – ShowCard/ShowForm/IdeaCard/IdeaForm, CustomDatePicker, CountryFlag (+ UnavailableFlag), StatsPanel.
- Blokkades: één record per persoon. `BlockGroup.tsx` toont blokkades op dezelfde datum als één regel ("Rob, Johnny, Joz · 3/4 afwezig", uitklapbaar; gelijke reden één regel). `blocks.ts`: `absentOn()` (ook periodes) voor de botsingwaarschuwing op showkaart en in ShowForm.
- Eigenaarschap ("één waarheid"): alleen de eigenaar wijzigt een show/idee/blokkade (alleen UI, `canEditOwned` in BandDashboard). Zonder eigenaar: alleen superadmin. Superadmin kan eigenaar altijd wijzigen. Firestore-regels bewust níet per eigenaar.
- Betalingen: `isPaid` op shows, `payment.ts`. Afgelopen bevestigde show met gage en niet betaald → rode kaart + kopje BETALINGEN bovenaan de agenda. Bijgehouden vanaf `PAYMENT_TRACKING_SINCE` (1 okt 2026); oudere shows gelden als betaald.
- App/PWA: `public/agenda.webmanifest` + `public/icons/*` (cirkellogo). Manifest wordt alleen op /agenda toegevoegd (`useAgendaAppManifest`); favicon staat in `index.html` voor de hele site.
- `src/lib/agendaStore.ts` – Firestore-collecties `shows`, `tourIdeas`, `publicShows` (audit-velden, `isDummy`); `testMode.ts`, `dummyData.ts`, `useSiteShows.ts`.
- `src/lib/outbound.ts` + `GoRedirect.tsx` – uitgaande links via `/go/<dienst>/<item>?to=<url>` (host-allowlist), zodat Vercel Analytics doorkliks per dienst/land telt.
- Google-login online via eigen domein: `firebase.ts` zet `authDomain` op de huidige host, `vercel.json` stuurt `/__/auth` en `/__/firebase` door naar disturbance-wpa.firebaseapp.com (nodig voor Safari/iPhone). Elk domein moet als redirect-URI `https://<domein>/__/auth/handler` in Google Cloud → Credentials staan.
- Thema's in `THEME_CONFIGS` (BandDashboard). ORIGINAL en Tox Populi kleuren Tailwinds emerald/amber/red-variabelen om via `.theme-original` / `.theme-tox` in index.css.
- `firestore.rules` – regels voor `disturbance-wpa`, met dezelfde e-maillijst als `bandAuth.ts`. Wordt niet automatisch gedeployd: plakken in Firebase console → Firestore → Rules.
- `api/stats.ts` – `?range=30d` live uit Vercel Web Analytics API; `?range=12m|all` opgeteld uit Firestore `statsDaily`.
- `api/stats-snapshot.ts` – Vercel Cron (`vercel.json`, dagelijks 04:20 UTC): bewaart dagcijfers in `statsDaily/{YYYY-MM-DD}`, vult tot 29 dagen terug aan. Alleen op Production.
- `api/_lib/analytics.ts` (Vercel API), `api/_lib/firestore.ts` (Firestore REST met service-account-JWT, geen firebase-admin).

## Environment Variables (Vercel, projectniveau)
- `STATS_VERCEL_TOKEN`, `STATS_TEAM_ID` – Production + Preview. Project-ID komt automatisch uit `VERCEL_PROJECT_ID` (`STATS_PROJECT_ID` is overbodig).
- `FIREBASE_SERVICE_ACCOUNT` – service-account JSON van `disturbance-wpa`, Production + Preview (Sensitive).
- `CRON_SECRET` – Production.
- Na het wijzigen van variabelen: **Redeploy van de juiste deployment** (die van de branch/commit, niet een oudere).
- Web Analytics is aangezet op 26 oktober 2026; daarvóór is er geen data.

## Status (31 okt 2026)
- Agenda live op disturbance.nl/agenda met echte data (import uit Google Doc, 30 okt). Inloggen per bandlid werkt; `firestore.rules` gepubliceerd.
- Importbestand `agenda-import.json` staat bewust buiten de repo (gages/contacten).
- Lokaal (`npm run dev`) toont Stats voorbeelddata: `/api` draait alleen op Vercel.

## Open
- ✅ Auth + strikte Firestore-regels (deadline 31 dec 2026), echte data geïmporteerd, live sinds 31 okt 2026.
- Google Doc op alleen-lezen (Joz).
- Demo-agenda (nepdata, geen login) op `/agenda/demo` én op Stickstaart-domein via apart Vercel-project met `VITE_APP_MODE=demo` zonder Firebase-variabelen. Wacht op keuze domein.
- Geparkeerd: BannerSlider, Spotify/YouTube-stats, agenda als product voor andere bands (aparte multi-tenant app, eigen Vercel Pro + Firebase-project, subdomein per band via CNAME + embed-code tourlijst).
