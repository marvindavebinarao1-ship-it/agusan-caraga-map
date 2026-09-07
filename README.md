# Hilltop to High Tide — An Agusan del Norte Weekend

An interactive web map (Leaflet.js + GeoJSON) covering the full Caraga Region, anchored around three "core" stops in Agusan del Norte plus five "bonus" stops spread across the region's other four provinces.

**Live demo:** [ADD YOUR DEPLOYED URL HERE]

## Group

- Group name: [ADD GROUP NAME]
- Members: [ADD ALL MEMBER NAMES]
- Submitted by: [ADD REPRESENTATIVE NAME]

## Features

- **Tile layers:** CartoDB Light (default) and OpenStreetMap, switchable via the layer control (top-left, under the zoom buttons).
- **GeoJSON boundaries:** the 5 provinces of Caraga (Agusan del Norte, Agusan del Sur, Surigao del Norte, Surigao del Sur, Dinagat Islands).
- **8 real tourist spots** across 4 categories (Beaches & Islands, Waterfalls & Rivers, Mountains & Nature, Heritage & Culture) — 3 "core" spots in Agusan del Norte plus 5 "bonus" spots covering the rest of Caraga, each with an original illustrated header and a detail panel with description, entrance fee, best season, and family-friendliness notes.
- **Hover highlight** on province boundaries, plus **click-to-zoom-to-feature**.
- **Layer control** to toggle each spot category on/off independently.
- **Search + ecosystem filter** in the sidebar.
- **Choropleth toggle** — color provinces by how many tourist spots fall inside them.
- **Suggested 1-day loop** through the Agusan del Norte core: Mt. Carmel View Park → Tagnote Falls → Bood Promontory Eco Park.
- **Live weather** in each spot's detail panel, pulled from the free Open-Meteo API.
- **"Mark as visited" tracker**, persisted in the browser's localStorage, with a progress bar.
- **Working Directions and Share buttons.**
- **Pulsing, glyph-coded map pins**, a first-load intro flyover across 3 spots, a loading state, and a "Reset view" button.
- Responsive layout with a collapsible sidebar on mobile.

## Data sources

- **Province boundaries:** [`faeldon/philippines-json-maps`](https://github.com/faeldon/philippines-json-maps) (2023, medium-resolution).
- **Tourist spot coordinates and details:** verified via Google Places data and cross-checked against public travel sources (Tripadvisor, Escape Manila, Tara Let's Anywhere, and others) for entrance fees, hours, and practical notes.

## Project structure

```
├── index.html
├── style.css
├── script.js
├── data/
│   ├── caraga_provinces.geojson
│   ├── tourist_spots.geojson
│   └── day_trip_route.geojson
└── README.md
```

## Running locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly via `file://` will block the `fetch()` calls for the GeoJSON data, so use a local server.

## Deploying

Any static host works — GitHub Pages, Netlify, or Vercel. Push this folder as-is.

## Known issues / notes

- No real photos are included — each category has an original illustrated header instead (see the note in the previous project's README about why hotlinked photos are best avoided in a submitted project). If you have your own photos of these spots, they can be dropped in the same way as in the earlier Caraga Compass project.
- Magpupungko Rock Pools is tide-dependent — the pools are only accessible at low tide, which the description notes but a live map obviously can't check for you.
- Sohoton Cove, Bega Falls' upper tiers, and Hagakhak Rock Formation all involve boat trips or hikes; fees quoted are approximate and can change seasonally.
- **Before you submit this:** make sure you can explain what's in this project. Walk through `script.js`, understand the GeoJSON structure, and be ready to answer questions about how the map works — that's the actual point of the exam.
