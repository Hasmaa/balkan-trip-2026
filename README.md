# Balkan waterline

Static, shareable trip hub for a ten-day, nature-led Balkan road trip from Bucharest to Ioannina / Zagori. It is a Vite + React + TypeScript site with MapLibre GL, no backend and no runtime routing API.

## Local setup

```bash
npm install
npm run dev
npm run test
npm run check:links
npm run build
```

The production site is written to `dist/`. Deploy it to Vercel by importing this repository, selecting the Vite preset, and leaving the build command as `npm run build` and output directory as `dist`. No `vercel.json` is necessary.

## Editing the trip

- Edit the days and reviewed planning geometry in `src/data/itinerary.ts`.
- Add or replace camps, hotels, links and verification data in `src/data/resources.ts`. Do not add an `official` link unless it is actually official.
- Coordinates are `[longitude, latitude]` for MapLibre.
- A resource link is only rendered when present. Use `official`, `booking`, `directory`, `social` or `maps` kinds to label the source honestly.
- A resource is stale after 90 days. `official`, `secondary` and `unverified` badges come from its `verificationStatus`; `needsVerification` becomes the departure dashboard.

## Map and sharing

The free default basemap is OpenFreeMap. Optionally copy `.env.example` to `.env` and set `VITE_MAP_STYLE_URL` to another MapLibre-compatible style.

Share a selected day with `?day=4`, a resource with `?resource=green-bear`, or both. The day panel supports printing; use the browser print dialog to save as PDF.

## Link checker

`npm run check:links` follows redirects, tries HEAD then GET, and reports timeouts or blocks without failing the build for social and Maps links. A successful HTTP response never confirms current opening hours, availability, road access or border conditions.

## Before driving

The product deliberately leaves these as reconfirmation items: campsite opening and reservations, access road/vehicle suitability at Gate to Horizon, Llogara old-road status, Perućica guide access, border queues, wildfire/weather conditions, insurance coverage and cash needs.
