/* ===========================================================
   Caraga Compass — Family Trip Map
   Leaflet.js + GeoJSON — Midterm Exam Project
   =========================================================== */

const CATEGORY_COLORS = {
  "Beaches & Islands": "#2f8fb0",
  "Waterfalls & Rivers": "#3f5fa0",
  "Mountains & Nature": "#4c7a3f",
  "Heritage & Culture": "#a8493a"
};

const CATEGORY_ICONS = {
  "Beaches & Islands": "🌊",
  "Waterfalls & Rivers": "💧",
  "Mountains & Nature": "⛰️",
  "Heritage & Culture": "🏛️"
};

// Original vector illustrations per category (no external images —
// avoids copyright/hotlink issues while still giving each spot real art).
const CATEGORY_ILLUSTRATIONS = {
  "Beaches & Islands": `
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <circle cx="205" cy="35" r="22" fill="#fff" opacity="0.85"/>
      <path d="M0,120 Q40,105 80,120 T160,120 T240,120 T320,120 T400,120 V200 H0 Z" fill="#ffffff" opacity="0.15"/>
      <path d="M0,145 Q40,130 80,145 T160,145 T240,145 T320,145 T400,145 V200 H0 Z" fill="#ffffff" opacity="0.22"/>
      <path d="M0,170 Q40,158 80,170 T160,170 T240,170 T320,170 T400,170 V200 H0 Z" fill="#ffffff" opacity="0.3"/>
      <g opacity="0.9">
        <path d="M60,200 C60,140 40,110 20,90 C55,95 78,130 80,160 Z" fill="#fff" opacity="0.5"/>
        <path d="M60,200 C60,150 78,115 100,95 C90,130 82,160 78,200 Z" fill="#fff" opacity="0.4"/>
      </g>
    </svg>`,
  "Waterfalls & Rivers": `
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M40,0 L120,0 L150,200 L10,200 Z" fill="#fff" opacity="0.14"/>
      <path d="M150,10 L230,10 L255,200 L120,200 Z" fill="#fff" opacity="0.1"/>
      <path d="M60,0 L70,0 L100,200 L55,200 Z" fill="#fff" opacity="0.35"/>
      <path d="M90,0 L98,0 L120,200 L82,200 Z" fill="#fff" opacity="0.3"/>
      <path d="M0,175 Q100,160 200,175 T400,175 V200 H0 Z" fill="#fff" opacity="0.4"/>
      <g opacity="0.5">
        <circle cx="60" cy="185" r="4" fill="#fff"/>
        <circle cx="90" cy="190" r="3" fill="#fff"/>
        <circle cx="40" cy="192" r="2.5" fill="#fff"/>
      </g>
    </svg>`,
  "Mountains & Nature": `
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,150 L70,70 L120,120 L180,55 L260,150 Z" fill="#fff" opacity="0.18"/>
      <path d="M120,150 L200,90 L250,130 L320,60 L400,150 Z" fill="#fff" opacity="0.28"/>
      <path d="M0,175 Q100,160 200,175 T400,175 V200 H0 Z" fill="#fff" opacity="0.35"/>
      <g fill="#fff" opacity="0.55">
        <path d="M60,40 q8,-10 16,0 q6,-8 14,0 q-4,10 -15,10 q-11,0 -15,-10 Z"/>
        <path d="M300,30 q7,-9 14,0 q5,-7 12,0 q-3,9 -13,9 q-10,0 -13,-9 Z"/>
      </g>
    </svg>`,
  "Heritage & Culture": `
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="45" r="26" fill="#fff" opacity="0.25"/>
      <path d="M60,190 L60,110 L340,110 L340,190 Z" fill="#fff" opacity="0.12"/>
      <path d="M40,110 L200,55 L360,110 Z" fill="#fff" opacity="0.3"/>
      <g fill="#fff" opacity="0.4">
        <rect x="80" y="120" width="18" height="70"/>
        <rect x="130" y="120" width="18" height="70"/>
        <rect x="180" y="120" width="18" height="70"/>
        <rect x="230" y="120" width="18" height="70"/>
        <rect x="280" y="120" width="18" height="70"/>
      </g>
      <path d="M0,195 L400,195 L400,200 L0,200 Z" fill="#fff" opacity="0.4"/>
    </svg>`
};

const CHOROPLETH_SCALE = ["#f3ead2", "#e2d9a8", "#c7bd6f", "#9ba648", "#4c7a3f"];

const VISITED_KEY = "agusan-caraga-visited";

// ---------- Map + base layers ----------

const map = L.map("map", { zoomControl: true }).setView([9.2, 126.0], 8);

const lightLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19
});

const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
});

osmLayer.addTo(map);

const baseLayers = {
  "CartoDB Light": lightLayer,
  "OpenStreetMap (default)": osmLayer
};

// ---------- State ----------

let provinceFeatureLayers = [];
let spotsData = null;
let markersByCategory = {};
let allMarkerEntries = [];   // {feature, marker, category, listEl}
let routeLayer = null;
let choroplethOn = false;
let activeFeature = null;
let currentFilterText = "";
let currentFilterCat = "";

function getVisited() {
  try { return JSON.parse(localStorage.getItem(VISITED_KEY)) || {}; }
  catch { return {}; }
}
function setVisited(map) {
  localStorage.setItem(VISITED_KEY, JSON.stringify(map));
}
function isVisited(name) {
  return !!getVisited()[name];
}
function toggleVisited(name, val) {
  const v = getVisited();
  v[name] = val;
  setVisited(v);
  updateProgress();
}
function updateProgress() {
  if (!spotsData) return;
  const v = getVisited();
  const total = spotsData.features.length;
  const count = spotsData.features.filter(f => v[f.properties.spot_name]).length;
  document.getElementById("visited-count").textContent = count;
  document.getElementById("visited-total").textContent = total;
  document.getElementById("progress-fill").style.width = `${(count / total) * 100}%`;
}

// ---------- Point-in-polygon (ray casting) ----------

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
function pointInPolygonCoords(point, polygonCoords) {
  if (!pointInRing(point, polygonCoords[0])) return false;
  for (let h = 1; h < polygonCoords.length; h++) {
    if (pointInRing(point, polygonCoords[h])) return false;
  }
  return true;
}
function pointInGeometry(point, geometry) {
  if (geometry.type === "Polygon") return pointInPolygonCoords(point, geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some(poly => pointInPolygonCoords(point, poly));
  return false;
}
function countSpotsInProvince(provinceFeature) {
  let count = 0;
  spotsData.features.forEach(spot => {
    if (pointInGeometry(spot.geometry.coordinates, provinceFeature.geometry)) count++;
  });
  return count;
}
function colorForCount(count, max) {
  if (max === 0 || count === 0) return CHOROPLETH_SCALE[0];
  const step = count / max;
  if (step <= 0.25) return CHOROPLETH_SCALE[1];
  if (step <= 0.5) return CHOROPLETH_SCALE[2];
  if (step <= 0.75) return CHOROPLETH_SCALE[3];
  return CHOROPLETH_SCALE[4];
}

// ---------- Province boundaries ----------

let homeBounds = null;
let introRunning = false;
let introTimeouts = [];

fetch("data/caraga_provinces.geojson")
  .then(res => res.json())
  .then(data => {
    const layer = L.geoJSON(data, {
      style: baseProvinceStyle,
      onEachFeature: (feature, lyr) => {
        provinceFeatureLayers.push({ feature, layer: lyr });
        lyr.bindTooltip(feature.properties.adm2_en, { sticky: true });
        lyr.on("mouseover", () => {
          lyr.setStyle({ weight: 2.5, color: "#d9a441", fillOpacity: 0.45 });
          lyr.bringToFront();
        });
        lyr.on("mouseout", () => {
          lyr.setStyle(choroplethOn ? choroplethStyle(feature) : baseProvinceStyle(feature));
        });
        lyr.on("click", () => map.fitBounds(lyr.getBounds(), { padding: [30, 30] }));
      }
    }).addTo(map);

    homeBounds = layer.getBounds();
    map.fitBounds(homeBounds, { padding: [20, 20] });
    return fetch("data/tourist_spots.geojson");
  })
  .then(res => res.json())
  .then(data => {
    spotsData = data;
    buildMarkers(data);
    buildSidebarList();
    buildLegend();
    buildLayerControl();
    updateProgress();

    document.getElementById("map-loading").classList.add("hidden");
    runIntroTour(data);
  })
  .catch(err => {
    console.error("Data load error:", err);
    const loading = document.getElementById("map-loading");
    loading.querySelector("span").textContent = "Couldn't load map data — check your connection.";
  });

// A brief animated tour on first load so the map feels alive rather than
// opening on a static, zoomed-out view.
function runIntroTour(data) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const stops = data.features.filter(f =>
    ["Mt. Carmel View Park", "Magpupungko Rock Pools", "Hagakhak Rock Formation"].includes(f.properties.spot_name)
  );
  if (!stops.length) return;

  introRunning = true;
  let delay = 500;
  stops.forEach((f) => {
    const [lng, lat] = f.geometry.coordinates;
    introTimeouts.push(setTimeout(() => map.flyTo([lat, lng], 10.5, { duration: 1.3 }), delay));
    delay += 1700;
  });
  introTimeouts.push(setTimeout(() => {
    if (homeBounds) map.flyToBounds(homeBounds, { padding: [20, 20], duration: 1.3 });
    setTimeout(() => { introRunning = false; }, 1400);
  }, delay));
}

// Reset-view button: appears once the user has moved away from the home extent.
const resetBtn = document.getElementById("reset-view");
L.DomEvent.disableClickPropagation(resetBtn);
resetBtn.addEventListener("click", () => {
  if (homeBounds) map.flyToBounds(homeBounds, { padding: [20, 20], duration: 0.8 });
});
map.on("moveend", () => {
  if (!homeBounds || introRunning) return;
  const atHome = map.getBounds().pad(-0.05).intersects(homeBounds) &&
    Math.abs(map.getZoom() - map.getBoundsZoom(homeBounds)) <= 1;
  resetBtn.classList.toggle("visible", !atHome);
});

function baseProvinceStyle() {
  return { color: "#8a7a52", weight: 1.2, fillColor: "#f3ead2", fillOpacity: 0.3 };
}
function choroplethStyle(feature) {
  const max = Math.max(...provinceFeatureLayers.map(p => countSpotsInProvince(p.feature)));
  const count = countSpotsInProvince(feature);
  return { color: "#4c7a3f", weight: 1.2, fillColor: colorForCount(count, max), fillOpacity: 0.75 };
}
function refreshProvinceStyles() {
  provinceFeatureLayers.forEach(({ feature, layer }) => {
    layer.setStyle(choroplethOn ? choroplethStyle(feature) : baseProvinceStyle(feature));
  });
}

// ---------- Markers ----------

function categoryColor(cat) { return CATEGORY_COLORS[cat] || "#999"; }

const CATEGORY_GLYPHS = {
  "Beaches & Islands": "M2,7 Q4,5.3 6,7 T10,7 T14,7" /* wave */,
  "Waterfalls & Rivers": "M5,1 L5,13 M8,1 L8,13" /* falls streaks */,
  "Mountains & Nature": "M1,11 L5,4 L7,7 L10,2 L14,11 Z" /* mountain */,
  "Heritage & Culture": "M2,5 L7,1 L12,5 M3,5 L3,12 M11,5 L11,12 M1,12 L13,12" /* temple */
};

function makeMarkerIcon(cat, visited) {
  const color = categoryColor(cat);
  const ring = visited ? "border:2.5px solid #d9a441;" : "border:2.5px solid white;";
  const glyph = CATEGORY_GLYPHS[cat] || "";
  return L.divIcon({
    className: "",
    html: `<div class="marker-pin" style="background:${color};${ring}">
      <span class="marker-pulse" style="background:${color}"></span>
      <svg class="marker-glyph" viewBox="0 0 15 14" width="11" height="10">
        <path d="${glyph}" stroke="white" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20]
  });
}

function buildMarkers(data) {
  data.features.forEach(feature => {
    const cat = feature.properties.category;
    if (!markersByCategory[cat]) markersByCategory[cat] = L.layerGroup().addTo(map);
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.marker([lat, lng], { icon: makeMarkerIcon(cat, isVisited(feature.properties.spot_name)) });
    marker.on("click", () => openDetail(feature));
    marker.addTo(markersByCategory[cat]);
    allMarkerEntries.push({ feature, marker, category: cat });
  });
}

function refreshMarkerIcons() {
  allMarkerEntries.forEach(entry => {
    entry.marker.setIcon(makeMarkerIcon(entry.category, isVisited(entry.feature.properties.spot_name)));
  });
}

function buildLayerControl() {
  L.control.layers(baseLayers, markersByCategory, { collapsed: true, position: "topleft" }).addTo(map);
}

function buildLegend() {
  const legend = document.getElementById("legend");
  Object.entries(CATEGORY_COLORS).forEach(([cat, color]) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    row.innerHTML = `<span class="swatch" style="background:${color}"></span>${cat}`;
    legend.appendChild(row);
  });
  const routeRow = document.createElement("div");
  routeRow.className = "legend-row";
  routeRow.innerHTML = `<span class="swatch line"></span>Suggested route`;
  legend.appendChild(routeRow);
}

// ---------- Detail panel ----------

const panel = document.getElementById("detail-panel");

function openDetail(feature) {
  if (introRunning) {
    introTimeouts.forEach(clearTimeout);
    introRunning = false;
  }
  activeFeature = feature;
  const p = feature.properties;
  const color = categoryColor(p.category);

  document.getElementById("detail-hero").style.background =
    `linear-gradient(160deg, ${color}, ${color}99)`;
  document.getElementById("detail-hero").innerHTML =
    `<span class="detail-hero-icon">${CATEGORY_ICONS[p.category] || "📍"}</span>${CATEGORY_ILLUSTRATIONS[p.category] || ""}`;
  document.getElementById("detail-cat").textContent = p.category;
  document.getElementById("detail-cat").style.background = color;
  document.getElementById("detail-name").textContent = p.spot_name;
  document.getElementById("detail-province").textContent = p.province ? `${p.province}${p.core ? " · Core stop" : " · Bonus stop"}` : "";
  document.getElementById("detail-desc").textContent = p.description;
  document.getElementById("detail-family").textContent = p.family_friendly;
  document.getElementById("detail-fee").textContent = p.entrance_fee;
  document.getElementById("detail-season").textContent = p.best_season;

  const visitedBox = document.getElementById("detail-visited");
  visitedBox.checked = isVisited(p.spot_name);
  visitedBox.onchange = () => {
    toggleVisited(p.spot_name, visitedBox.checked);
    refreshMarkerIcons();
    buildSidebarList();
  };

  const [lng, lat] = feature.geometry.coordinates;
  loadWeather(lat, lng);

  document.getElementById("btn-directions").onclick = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };
  document.getElementById("btn-share").onclick = () => shareSpot(p, lat, lng);

  panel.classList.remove("hidden");
  map.flyTo([lat, lng], Math.max(map.getZoom(), 11), { duration: 0.8 });

  highlightListItem(p.spot_name);
}

document.getElementById("detail-close").addEventListener("click", () => {
  panel.classList.add("hidden");
  activeFeature = null;
});

function shareSpot(props, lat, lng) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const text = `${props.spot_name} — ${props.category} in Caraga. ${props.description}`;
  if (navigator.share) {
    navigator.share({ title: props.spot_name, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
      const btn = document.getElementById("btn-share");
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = original; }, 1400);
    });
  }
}

// Weather via Open-Meteo (no API key required)
function loadWeather(lat, lng) {
  const iconEl = document.getElementById("weather-icon");
  const tempEl = document.getElementById("weather-temp");
  iconEl.textContent = "…";
  tempEl.textContent = "Loading weather…";

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
    .then(res => res.json())
    .then(data => {
      const w = data.current_weather;
      if (!w) throw new Error("no data");
      const { emoji, label } = weatherCodeInfo(w.weathercode);
      iconEl.textContent = emoji;
      tempEl.textContent = `${Math.round(w.temperature)}°C — ${label}`;
    })
    .catch(() => {
      iconEl.textContent = "🌤️";
      tempEl.textContent = "Weather unavailable right now";
    });
}

function weatherCodeInfo(code) {
  const map = {
    0: { emoji: "☀️", label: "Clear sky" },
    1: { emoji: "🌤️", label: "Mostly clear" },
    2: { emoji: "⛅", label: "Partly cloudy" },
    3: { emoji: "☁️", label: "Overcast" },
    45: { emoji: "🌫️", label: "Fog" },
    48: { emoji: "🌫️", label: "Fog" },
    51: { emoji: "🌦️", label: "Light drizzle" },
    53: { emoji: "🌦️", label: "Drizzle" },
    55: { emoji: "🌧️", label: "Dense drizzle" },
    61: { emoji: "🌧️", label: "Light rain" },
    63: { emoji: "🌧️", label: "Rain" },
    65: { emoji: "🌧️", label: "Heavy rain" },
    80: { emoji: "🌦️", label: "Rain showers" },
    81: { emoji: "🌧️", label: "Rain showers" },
    82: { emoji: "⛈️", label: "Violent showers" },
    95: { emoji: "⛈️", label: "Thunderstorm" }
  };
  return map[code] || { emoji: "🌤️", label: "Weather update" };
}

// ---------- Sidebar list ----------

function highlightListItem(name) {
  document.querySelectorAll(".spot-item").forEach(el => {
    el.classList.toggle("active", el.dataset.name === name);
  });
}

function buildSidebarList() {
  if (!spotsData) return;
  const list = document.getElementById("spot-list");
  const countEl = document.getElementById("results-count");
  list.innerHTML = "";

  const term = currentFilterText.trim().toLowerCase();
  const filtered = spotsData.features.filter(f => {
    const matchesText = !term ||
      f.properties.spot_name.toLowerCase().includes(term) ||
      f.properties.category.toLowerCase().includes(term);
    const matchesCat = !currentFilterCat || f.properties.category === currentFilterCat;
    return matchesText && matchesCat;
  });

  countEl.textContent = `Showing ${filtered.length} of ${spotsData.features.length} spots`;

  filtered.forEach(feature => {
    const p = feature.properties;
    const li = document.createElement("li");
    li.className = "spot-item" + (isVisited(p.spot_name) ? " is-visited" : "");
    li.dataset.name = p.spot_name;
    li.innerHTML = `
      <span class="thumb" style="background:linear-gradient(160deg, ${categoryColor(p.category)}, ${categoryColor(p.category)}99)">
        ${CATEGORY_ILLUSTRATIONS[p.category] || ""}
      </span>
      <span class="spot-text">
        <span class="spot-name">${p.spot_name}</span><br/>
        <span class="spot-cat">${p.category}</span>
      </span>
      <span class="visited-check">✓</span>
    `;
    li.addEventListener("click", () => {
      openDetail(feature);
      if (window.innerWidth <= 860) document.getElementById("sidebar").classList.remove("open");
    });
    list.appendChild(li);
  });
}

document.getElementById("search-input").addEventListener("input", (e) => {
  currentFilterText = e.target.value;
  buildSidebarList();
});
document.getElementById("ecosystem-select").addEventListener("change", (e) => {
  currentFilterCat = e.target.value;
  buildSidebarList();
});

// ---------- Choropleth ----------

document.getElementById("choropleth-toggle").addEventListener("change", (e) => {
  choroplethOn = e.target.checked;
  refreshProvinceStyles();
});

// ---------- Day-trip route ----------

fetch("data/day_trip_route.geojson")
  .then(res => res.json())
  .then(data => {
    routeLayer = L.geoJSON(data, { style: { color: "#c1543f", weight: 3, dashArray: "8 6" } });
    routeLayer.addTo(map);
    routeLayer.bindTooltip(data.features[0].properties.description);
  })
  .catch(err => console.error("Route load error:", err));

document.getElementById("route-toggle").addEventListener("change", (e) => {
  if (!routeLayer) return;
  if (e.target.checked) routeLayer.addTo(map);
  else map.removeLayer(routeLayer);
});

// ---------- Mobile sidebar ----------

document.getElementById("sidebar-toggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});
