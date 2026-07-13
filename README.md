# Balkan waterline

Static, shareable trip hub for a ten-day, nature-led Balkan road trip from Bucharest to Ioannina / Zagori. It is a Vite + React + TypeScript site with MapLibre GL, no backend and no runtime routing API.

## Local setup

Requires Node 20.19+ (see `.nvmrc`; run `nvm use`). The repo uses pnpm, pinned via `packageManager`.

```bash
npm install
npm run dev
npm run test
npm run check:links
npm run build       # writes the static site to dist/
npm run build:routes # optional: re-bake driving routes (see below)
```

## Deploy (Render)

The production site is written to `dist/` and deploys to [Render](https://render.com) as a **free static site** using the committed `render.yaml` blueprint — no backend, no runtime API.

1. In the Render dashboard choose **New → Blueprint**.
2. Connect this repository and click **Apply**.

Render reads `render.yaml`: it runs `npm run build` and publishes `dist/`, pinning Node `20.19.0` and `pnpm@9.15.9` so installs are deterministic. Every push to `main` redeploys automatically. No environment variables are required — the map falls back to the free OpenFreeMap style unless you set `VITE_MAP_STYLE_URL`.

Prefer the manual path? **New → Static Site** → pick the repo → build command `npm run build`, publish directory `dist`.

## Editing the trip

- Edit the days and reviewed planning geometry in `src/data/itinerary.ts`.
- Add or replace camps, hotels, links and verification data in `src/data/resources.ts`. Do not add an `official` link unless it is actually official.
- Coordinates are `[longitude, latitude]` for MapLibre.
- A resource link is only rendered when present. Use `official`, `booking`, `directory`, `social` or `maps` kinds to label the source honestly.
- A resource is stale after 90 days. `official`, `secondary` and `unverified` badges come from its `verificationStatus`; `needsVerification` becomes the departure dashboard.

## Map and sharing

The free default basemap is OpenFreeMap. Optionally copy `.env.example` to `.env` and set `VITE_MAP_STYLE_URL` to another MapLibre-compatible style.

Each day's road route lives in `src/data/routeGeometry.ts`, baked once (offline) so the site needs no runtime routing API. Regenerate it with `npm run build:routes` after changing a day's endpoints in `itinerary.ts`; it fetches driving geometry from OSRM and rewrites the file. A day with no baked route falls back to a straight origin→destination line. The geometry is planning-only — a snapshot, not live road conditions.

Share a selected day with `?day=4`, a resource with `?resource=green-bear`, and the start date with `?start=2026-07-22` — combine them freely. The day panel supports printing; use the browser print dialog to save as PDF.

## Link checker

`npm run check:links` follows redirects, tries HEAD then GET, and reports timeouts or blocks without failing the build for social and Maps links. A successful HTTP response never confirms current opening hours, availability, road access or border conditions.

## Before driving

The product deliberately leaves these as reconfirmation items: campsite opening and reservations, access road/vehicle suitability at Gate to Horizon, Llogara old-road status, Perućica guide access, border queues, wildfire/weather conditions, insurance coverage and cash needs.
