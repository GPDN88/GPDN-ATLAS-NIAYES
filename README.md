# Handoff: Atlas SfN Dakar–Niayes — application installable (mobile Samsung + ordinateur)

## Overview
Interactive atlas of the 15 Nature-based Solution (SfN) sites of project **GEF 12082 / PIMS 10290** (10 retention basins in Dakar, 5 natural outlets in the Niayes). It shows verified/corrected site coordinates, per-site fact sheets, SfN and non-SfN interventions, Niayes water-risk zones, projections, a 3D view and PDF/GeoJSON/CSV exports.

This handoff covers turning the atlas into an **installable Progressive Web App (PWA)** that:
- installs on a **Samsung Galaxy phone** (Samsung Internet / Chrome Android) as a home-screen app, full screen;
- installs on a **laptop** (Chrome / Edge on Windows, macOS, Linux) as a standalone windowed app;
- works **offline** (app shell + pre-cached satellite tiles around the 15 sites);
- offers **GPS location** + nearest-site lookup for field work.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to ship as-is. The task is to **recreate this design in the target codebase's environment** using its established patterns. If no environment exists yet, a sensible choice is: Vite + vanilla TS or React, Leaflet (or MapLibre), `vite-plugin-pwa` (Workbox) for the service worker/manifest. Optionally wrap with **Capacitor** (Android APK/AAB for Samsung Galaxy Store / Play) and **Tauri/Electron** if a true native installer is required — but the PWA alone satisfies "downloadable on phone and laptop".

**Deployment requirement:** PWA install only works over **HTTPS** (or localhost). The app must be hosted (Genspark Code deployment, GitHub Pages, Netlify, project server…). All files must be served from the same directory as `index.html` (relative paths; manifest `scope: "./"`).

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-accurately. Atlas content/data logic (`atlas-*.js`) is functional and should be ported faithfully (data in `atlas-data.js`, `atlas-verif.js`, `atlas-vuln.js` is the source of truth).

## Screens / Views

### 1. Atlas — Desktop / laptop (≥ 1181px)
- **Layout:** CSS grid `grid-template-columns: 440px 1fr; height: 100vh`.
  - Left `aside`: column flex, background `#f6f3ec`, right border `1px solid #d9d2c2`.
  - Right `#mapwrap`: full Leaflet map (`#map` absolute inset 0, bg `#cfd8d6`).
- **Brand block** (`.brand`, padding `16px 20px 12px`, bottom border):
  - Kicker "GEF 12082 · PIMS 10290 · FEM-8 LDCF" — IBM Plex Mono 600 10.5px, letter-spacing .12em, uppercase, `#6b7090`.
  - Title "Atlas des sites SfN — Dakar & Niayes" — IBM Plex Sans Condensed 600 19px/1.2, `#1b2453`.
  - **App bar** (`.appbar`, flex, gap 6px, margin-top 10px):
    - "⤓ Installer l'application" — filled button: bg `#1b2453`, white, border 1px `#1b2453`, Plex Sans Condensed 600 12px, padding 6px 11px, radius 4px. Hidden when running standalone.
    - "Hors ligne" — ghost variant: bg `#fff`, text `#1b2453`. Progress text "Hors ligne NN %" while caching, then "Hors ligne ✓".
    - Network status (right-aligned): Plex Mono 600 10.5px, `#6b7090`: "EN LIGNE" / "APP · EN LIGNE" (standalone) / "HORS LIGNE" in `#b23a2e`.
- **Tabs** (`.tabs`, bg `#ece7db`): Sites (15) · SfN · Hors SfN · Niayes · eau · Projections · Méthode. Plex Sans Condensed 600 11.5–12px, `#6b7090`; active: text `#1b2453`, bg `#f6f3ec`, 2px bottom border `#1b2453`.
- **Panes:** scrollable, padding `16px 20px 28px`. Site list rows: grid `26px 1fr auto`, numbered badges (circle `#1f7a8c` for basins, rounded square `#b5651d` for outlets), status flags (Validé green / Approximatif amber / Erroné red).
- **Map overlays:** scale presets bar top-center (1/1 000 … 1/1 000 000), basemap switch top-right (Satellite / Plan OSM / Topo), scale readout bottom-right, cursor coordinates bottom-left (navy chip).
- **GPS button** (`.locbtn`): 40×40 circle, white, glyph "◎" Plex Mono 600 20px, shadow `0 1px 6px rgba(0,0,0,.25)`, at right 12px / bottom 96px. Active: bg `#1b2453`, white glyph.

### 2. Atlas — Laptop medium (821–1180px)
Same as desktop with sidebar `380px`, tab buttons 11px / padding `10px 2px`.

### 3. Atlas — Phone (≤ 820px, e.g. Samsung Galaxy)
- **Map full screen** (`#app` block, `height: 100dvh`; `#mapwrap` absolute inset 0).
- **Bottom sheet** (`aside#sheet`): absolute bottom, z-index 1200, height `calc(100dvh - 56px - env(safe-area-inset-top))`, radius `16px 16px 0 0`, shadow `0 -4px 24px rgba(0,0,0,.22)`.
  - 3 states via `transform: translateY(...)`:
    - **peek** (default): `translateY(calc(100% - var(--peek,168px)))` — shows grip, brand, app bar, tabs.
    - **half**: `translateY(48%)`.
    - **full**: `translateY(0)`.
  - Transition `transform .32s cubic-bezier(.2,.8,.2,1)`; disabled while dragging.
  - **Grip:** 40×5px pill `#c9c1ae`, radius 3px, padding `8px 0 2px`.
- Brand title 17px, kicker 9.5px; padding `4px 16px 10px`.
- **Tabs:** horizontally scrollable (hidden scrollbar), each `flex: 0 0 auto`, padding `12px 14px`, 13px, min-height 44px.
- Touch sizes: rows min-height 52px (name 14.5px, sub 11.5px), `.btn` min-height 44px / 13.5px, checkboxes 20×20, body text 14px.
- **Map controls:** scale bar top-left (scrollable, `max-width: calc(100% - 110px)`, buttons 11px), basemap top-right; both offset by `env(safe-area-inset-top)`. Zoom control, scale readout and cursor readout hidden (pinch-zoom). Leaflet bottom controls + GPS button (46×46) sit above the peek height.
- **3D view:** fixed full screen; side card moves to the bottom (`left/right 10px; bottom 70px; max-height 34vh; scroll`), legend hidden.

### 4. Install dialog (fallback when no native prompt)
Overlay `rgba(27,36,83,.4)`, card aligned bottom: bg `#f6f3ec`, radius 10px, padding `16px 18px`, max-width 420px, 14px/1.5 text; title Plex Sans Condensed 600 17px "Installer l'atlas"; button "Compris" (filled). Copy depends on user agent:
- **Samsung Internet:** "Dans Samsung Internet : touchez le menu ≡ en bas à droite, puis « Ajouter la page à » → « Écran d'accueil ». L'atlas s'ouvrira ensuite comme une application, en plein écran."
- **Chrome Android:** "Dans Chrome : touchez le menu ⋮ en haut à droite, puis « Installer l'application » (ou « Ajouter à l'écran d'accueil »)."
- **iOS Safari:** "Dans Safari : touchez Partager puis « Sur l'écran d'accueil »."
- **Desktop:** "Sur ordinateur, ouvrez l'atlas dans Chrome ou Edge : cliquez sur l'icône ⊕ Installer à droite de la barre d'adresse (ou menu ⋮ → « Installer Atlas SfN »). L'atlas s'ouvre alors dans sa propre fenêtre, avec une icône sur le bureau et dans la barre des tâches."

### 5. Toast
Fixed bottom-center, bg `#1b2453`, white, Plex Sans Condensed 600 13px, padding `10px 16px`, radius 6px, max-width 90vw. Enter: opacity 0→1 + translateY(20px→0), .25s. Auto-hide 2.6s (3.6–4s for longer messages). On phone it sits above the sheet peek.

### 6. Install guide page (`Installer l'application.html`)
Static page, max-width 980px, padding `40px 24px 60px`. Header: 72px app icon (radius 16px) + kicker + title 30px. CTA "Ouvrir l'atlas →" (navy, 15px, padding 12px 20px, radius 6px). Two white cards (border `#d9d2c2`, radius 8px, padding 20px 22px) — "Téléphone Samsung Galaxy" and "Ordinateur portable" — with numbered steps. Three feature notes (Hors ligne / GPS / Une seule version) with 2px navy top rule. Yellow notice (`#fff8e6`, border `#ecd9a8`) explaining the HTTPS requirement. Single column ≤ 720px.

## Interactions & Behavior
- **Install:** listen for `beforeinstallprompt`, `preventDefault()`, store event; button calls `prompt()` and awaits `userChoice`. `appinstalled` → hide button + toast "Atlas installé ✓ — retrouvez-le sur votre écran d'accueil / bureau". Without a stored event → show the UA-specific dialog. Hide button in `display-mode: standalone`.
- **Bottom sheet (phone):**
  - Tap grip/brand (no drag) cycles peek → half → full → peek.
  - Drag on grip/brand (touch + mouse); ignore when the target is a `button`. Release: velocity < −0.5 px/ms → up one step; > 0.5 → down one step; otherwise snap by position ratio (<0.25 full, <0.7 half, else peek).
  - Tapping a tab while in peek → half.
  - Selecting a site (list row or map marker) → `ATLAS.select(id)` then sheet to half and scroll the Sites pane to top.
  - Call `map.invalidateSize()` ~340ms after each state change and on window resize.
- **Offline pre-cache ("Hors ligne"):** requires online. Builds the tile URL set: Esri World_Imagery z9–12 over bbox centered on 14.80 N / −17.10 (±0.35°); for each site, z13–17 imagery + Esri reference labels within ±0.012° (z<16) or ±0.005° (z≥16). Fetches with 6 parallel workers, `mode:'no-cors'`, into Cache `atlas-tiles-v1` (skip if already cached). Progress every 20 tiles. Final toast: "N tuiles satellite enregistrées : les 15 sites restent consultables sans réseau".
- **GPS (◎):** toggles `watchPosition` (high accuracy, maximumAge 5s). Draws an accuracy circle (`#2a7de1`, weight 1, fill .12) + a 16px blue dot (`#2a7de1`, 3px white border, halo `0 0 0 6px rgba(42,125,225,.25)`), tooltip with lat/lon (6 decimals, W positive) and ± accuracy. First fix: fly to position (zoom ≥ 15, .8s) and toast nearest site: "Site le plus proche : {id} · {nom} — {m or km}". Error → "Position refusée ou indisponible".
- **Network status:** `online`/`offline` events; going offline shows toast "Hors ligne — les données et le fond de carte déjà chargés restent disponibles".
- **Deep links:** `?tab=sites|sfn|hors|niayes|proj|meth` opens that tab (used by manifest shortcuts).
- **Desktop installed window:** supports `display_override: window-controls-overlay`; brand area becomes the drag region (`app-region: drag`), buttons `no-drag`, top padding `env(titlebar-area-height)`.
- Existing atlas behaviors (tabs, site fiche, layers, scales, 3D, PDF export) are unchanged — see `atlas-panels.js`, `atlas-map.js`, `atlas-3d.js`, `atlas-pdf.js`. Last tab persisted in `localStorage['atlas_tab']`.

## State Management
- `deferredInstallPrompt` (event | null), `isStandalone` (bool).
- `sheetState`: `'peek' | 'half' | 'full'`; drag state (`startY`, `startTime`, `moved`).
- `online` (bool); `offlineCaching` (progress 0–100, done flag).
- `geoWatchId` (number | null), `myPosition` (lat, lon, accuracy), `nearestSite`.
- Atlas state (existing): `ATLAS.state = { mode, scen, sel }`, layer toggles `ATLAS.on`.
- No backend: all data is static JS (`ATLAS_SITES`, `ATLAS_PROJECT`, `ATLAS_NIAYES`, `ATLAS_AXES`, `ATLAS_ZONES`, `ATLAS_MARIGOTS`, etc.).

## Service worker (`sw.js`)
- Cache `atlas-sfn-v1`: app shell (HTML, CSS, all `atlas-*.js`, `app/*`, icons, Leaflet CSS/JS from unpkg) precached on install (failures tolerated); `skipWaiting` + `clients.claim`.
- Tile hosts (`arcgisonline.com`, `tile.openstreetmap.org`, `tile.opentopomap.org`): **cache-first** in `atlas-tiles-v1`, store opaque responses.
- Everything else: **network-first**, update cache, fall back to cache; navigations fall back to `index.html`.
- Old caches deleted on activate. Bump the version string on each release.
- Note: OSM tile policy discourages bulk prefetch — the pre-cache uses only Esri imagery; check Esri terms of use for production offline use, or self-host tiles (e.g. PMTiles) for robust offline.

## Manifest (`manifest.webmanifest`)
name "Atlas SfN Dakar–Niayes · GEF 12082", short_name "Atlas SfN", lang fr, start_url/id `./index.html`, scope `./`, display `standalone` (+ override `window-controls-overlay`), orientation any, background `#f6f3ec`, theme `#1b2453`, icons 192/512 (any) + 512 maskable, shortcuts Sites / SfN / Projections. HTML head also sets `theme-color`, `mobile-web-app-capable`, apple meta tags, and `viewport-fit=cover`.

## Design Tokens
**Colors**
- Ink `#1b2453` · Ink 2 `#3b4475` · Mute `#6b7090`
- Paper `#f6f3ec` · Paper 2 `#ece7db` · Line `#d9d2c2` · Grip `#c9c1ae`
- Water / basin `#1f7a8c` · Outlet `#b5651d` · Green `#3f7d3a` · Red `#b23a2e` · Amber `#c98a12`
- Niayes band `#d9b44a` / fill `#e8cf6a` · Axes `#4a63c9` · GPS `#2a7de1`
- Note bg `#fff8e6` / border `#ecd9a8`; red note `#fbecea` / `#e6bdb7`; OK flag `#e7f1e5`; warn flag `#fdf3dc` / `#9a6a00`

**Typography** (Google Fonts)
- IBM Plex Sans 400/600 — body (13px desktop, 14px phone, lh 1.5)
- IBM Plex Sans Condensed 500/600 — titles, buttons, tabs (11.5–19px; 30px on install page)
- IBM Plex Mono 400/600 — kickers, coordinates, numbers (9.5–12px, uppercase kickers letter-spacing .1–.12em)

**Radius:** 3px (flags), 4px (buttons, cards, rows), 5–6px (panels, toast), 8–10px (install cards/dialog), 16px (sheet top), 50% (markers, GPS button).
**Shadows:** controls `0 1px 6px rgba(0,0,0,.15–.25)`; scale bar `0 2px 10px rgba(0,0,0,.18)`; sheet `0 -4px 24px rgba(0,0,0,.22)`; dialogs `0 10px 40px rgba(0,0,0,.3)`.
**Spacing:** 4 / 6 / 8 / 10 / 12 / 16 / 20 px; touch targets ≥ 44px on phone.
**Breakpoints:** ≤ 820px phone · 821–1180px laptop medium · ≥ 1181px desktop · install page single column ≤ 720px.

## Assets
- `app/icon-192.png`, `app/icon-512.png`, `app/icon-maskable-512.png` (18% safe padding), `app/apple-touch-icon.png` (180px) — generated: navy square, paper card, yellow coast band, teal circles (basins), orange square (outlet), green dot.
- Basemaps (runtime, not bundled): Esri World Imagery + World Boundaries & Places, OpenStreetMap, OpenTopoMap — attributions shown on the map.
- Libraries via CDN: Leaflet 1.9.4 (unpkg), three.js 0.128 + OrbitControls (jsDelivr, lazy, 3D view), html2pdf.js 0.10.1 (cdnjs, lazy, PDF export). Bundle these locally in production for offline robustness.
- Reference images (`ref/*.jpg`) and deliverables (`livrables/`) in the source project are not included — documentation only.

## Files
- `index.html` — **primary entry**: installable app (adds manifest, PWA meta, install/offline/GPS controls, bottom sheet).
- `app/mobile.css` — app bar, toast, dialogs, GPS button, responsive phone/laptop layout, window-controls-overlay.
- `app/app.js` — install flow, SW registration, network status, tile pre-cache, GPS, bottom-sheet gestures, `?tab=` deep links.
- `manifest.webmanifest`, `sw.js` — PWA manifest and service worker.
- `Installer l'application.html` — user-facing install guide.
- `Atlas SfN Dakar-Niayes.html` — original desktop-only atlas (reference).
- `atlas.css` — base atlas styles and tokens.
- `atlas-data.js` (sites, project, Niayes, axes, zones), `atlas-verif.js` (coordinate verification), `atlas-vuln.js` (vulnerability matrix), `atlas-map.js` (Leaflet map, basemaps, scales, layers), `atlas-panels.js` (tabs, list, fiche, exports), `atlas-sfn.js` / `atlas-sfn-map.js` (SfN layer), `atlas-hors.js` (non-SfN), `atlas-pdf.js` (PDF export), `atlas-3d.js` / `atlas-3d-hors.js` (3D view).
