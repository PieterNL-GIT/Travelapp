const STORAGE_KEY = "travelapp-state-v2";
const MAPS_KEY_STORAGE = "travelapp-google-maps-key";

const categories = [
  "Highlights",
  "Eten & drinken",
  "Hotels & verblijf",
  "Cultuur & musea",
  "Natuur & strand",
  "Kids proof",
  "Transport",
  "Budget tips"
];

const fallbackInspiration = {
  blogs: [
    "Gebruik 'Lonely Planet + bestemming + family travel' voor extra blogs.",
    "Zoek op YouTube: 'destination family itinerary' voor dagroutes.",
    "Tip: check lokale city-passen en kindvriendelijke musea."
  ],
  social: [
    "Probeer hashtags: #familytravel + bestemming.",
    "Check lokale creators voor realtime foodspots.",
    "Sla short-form routes op in je categorie 'Highlights'."
  ]
};

const refs = {
  tripForm: document.getElementById("trip-form"),
  tripName: document.getElementById("trip-name"),
  tripDestination: document.getElementById("trip-destination"),
  tripSelect: document.getElementById("trip-select"),
  tripSummary: document.getElementById("trip-summary"),
  memberForm: document.getElementById("member-form"),
  memberName: document.getElementById("member-name"),
  memberList: document.getElementById("member-list"),
  itemForm: document.getElementById("item-form"),
  itemCategory: document.getElementById("item-category"),
  itemTitle: document.getElementById("item-title"),
  itemNotes: document.getElementById("item-notes"),
  categoryColumns: document.getElementById("category-columns"),
  routeForm: document.getElementById("route-form"),
  routeDay: document.getElementById("route-day"),
  routeStop: document.getElementById("route-stop"),
  routeTime: document.getElementById("route-time"),
  routeList: document.getElementById("route-list"),
  map: document.getElementById("map"),
  mapStatus: document.getElementById("map-status"),
  mapsApiKey: document.getElementById("maps-api-key"),
  saveApiKey: document.getElementById("save-api-key"),
  blogList: document.getElementById("blog-list"),
  socialList: document.getElementById("social-list"),
  refreshInspiration: document.getElementById("refresh-inspiration")
};

let state = loadState();
let map;
let geocoder;
let directionsService;
let directionsRenderer;

function createTrip(name, destination) {
  return {
    id: crypto.randomUUID(),
    name,
    destination,
    members: [],
    items: categories.reduce((acc, category) => ({ ...acc, [category]: [] }), {}),
    route: []
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.trips = parsed.trips.map((trip) => normalizeTrip(trip));
    return parsed;
  }

  const starter = createTrip("Voorbeeldreis", "Toscane, Italië");
  starter.members = ["Jij", "Je partner"];
  starter.items["Highlights"].push({ title: "San Gimignano", notes: "Mooie torenstad" });
  starter.route.push({ day: "Dag 1", stop: "Florence", time: "09:00" });
  starter.route.push({ day: "Dag 2", stop: "Siena", time: "10:30" });

  return {
    selectedTripId: starter.id,
    trips: [starter]
  };
}

function normalizeTrip(trip) {
  const normalized = {
    ...trip,
    items: trip.items || {},
    route: trip.route || [],
    members: trip.members || []
  };

  categories.forEach((category) => {
    normalized.items[category] = normalized.items[category] || [];
  });

  return normalized;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSelectedTrip() {
  return state.trips.find((trip) => trip.id === state.selectedTripId) || state.trips[0];
}

function renderTripOptions() {
  refs.tripSelect.innerHTML = "";
  state.trips.forEach((trip) => {
    const option = document.createElement("option");
    option.value = trip.id;
    option.textContent = `${trip.name} · ${trip.destination}`;
    refs.tripSelect.append(option);
  });
  refs.tripSelect.value = state.selectedTripId;
}

function renderMembers(trip) {
  refs.memberList.innerHTML = "";
  if (!trip.members.length) {
    refs.memberList.innerHTML = "<li class='muted'>Nog geen reisgenoten toegevoegd.</li>";
    return;
  }

  trip.members.forEach((member) => {
    const li = document.createElement("li");
    li.textContent = member;
    refs.memberList.append(li);
  });
}

function renderCategorySelect() {
  refs.itemCategory.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    refs.itemCategory.append(option);
  });
}

function renderCategories(trip) {
  refs.categoryColumns.innerHTML = "";

  categories.forEach((category) => {
    const block = document.createElement("article");
    block.className = "category";
    const title = document.createElement("h3");
    title.textContent = category;
    block.append(title);

    const list = document.createElement("ul");
    const items = trip.items[category] || [];

    if (!items.length) {
      list.innerHTML = "<li class='muted'>Nog niets opgeslagen.</li>";
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.title}</strong>${item.notes ? `<br><span class='muted'>${item.notes}</span>` : ""}`;
        list.append(li);
      });
    }

    block.append(list);
    refs.categoryColumns.append(block);
  });
}

function renderRoute(trip) {
  refs.routeList.innerHTML = "";
  if (!trip.route.length) {
    refs.routeList.innerHTML = "<li class='muted'>Nog geen routepunten.</li>";
    return;
  }

  trip.route.forEach((stop, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${stop.day}: ${stop.stop}${stop.time ? ` (${stop.time})` : ""}`;
    refs.routeList.append(li);
  });
}

function renderTripSummary(trip) {
  refs.tripSummary.textContent = `Reis '${trip.name}' actief: ${trip.members.length} reisgenoten, ${trip.route.length} routepunten, bestemming ${trip.destination}.`;
}

async function fetchWikipediaInspiration(destination) {
  const url = `https://nl.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(destination + " reis")} &limit=5&namespace=0&format=json&origin=*`;
  const response = await fetch(url.replace(" ", ""));
  if (!response.ok) {
    throw new Error("Wikipedia bron niet beschikbaar");
  }

  const data = await response.json();
  return data[1].map((title, index) => ({
    title,
    description: data[2][index] || "Wikipedia artikel",
    url: data[3][index]
  }));
}

async function fetchRedditInspiration(destination) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(destination + " travel itinerary")}&sort=hot&t=month&limit=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Reddit bron niet beschikbaar");
  }

  const data = await response.json();
  return data.data.children.map((item) => ({
    title: item.data.title,
    url: `https://www.reddit.com${item.data.permalink}`,
    score: item.data.score
  }));
}

function renderInspirationLists(blogItems, socialItems) {
  refs.blogList.innerHTML = "";
  refs.socialList.innerHTML = "";

  blogItems.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a><br><span class="muted">${item.description || "Live bron"}</span>`;
    refs.blogList.append(li);
  });

  socialItems.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a><br><span class="muted">Score: ${item.score ?? "n.v.t."}</span>`;
    refs.socialList.append(li);
  });
}

async function refreshInspiration() {
  const trip = getSelectedTrip();
  refs.blogList.innerHTML = "<li class='muted'>Zoeken naar blogbronnen...</li>";
  refs.socialList.innerHTML = "<li class='muted'>Zoeken naar community trends...</li>";

  try {
    const [wiki, reddit] = await Promise.all([
      fetchWikipediaInspiration(trip.destination),
      fetchRedditInspiration(trip.destination)
    ]);

    renderInspirationLists(
      wiki.length ? wiki : fallbackInspiration.blogs.map((title) => ({ title, url: "#" })),
      reddit.length ? reddit : fallbackInspiration.social.map((title) => ({ title, url: "#" }))
    );
  } catch (error) {
    renderInspirationLists(
      fallbackInspiration.blogs.map((title) => ({ title, url: "#", description: "Fallback tip" })),
      fallbackInspiration.social.map((title) => ({ title, url: "#", score: "Fallback" }))
    );
  }
}

function setMapStatus(text) {
  refs.mapStatus.textContent = text;
}

function loadMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script kon niet laden."));
    document.head.append(script);
  });
}

async function initializeMap() {
  const apiKey = localStorage.getItem(MAPS_KEY_STORAGE);
  if (!apiKey) {
    setMapStatus("Voeg je Google Maps API key toe om live routekaart te tonen.");
    return;
  }

  try {
    await loadMapsScript(apiKey);
    map = new google.maps.Map(refs.map, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map, suppressMarkers: false });
    setMapStatus("Google Maps actief. Route wordt automatisch geüpdatet op basis van actieve reis.");
    await refreshMapRoute();
  } catch (error) {
    setMapStatus("Google Maps laden mislukte. Controleer je API key of billing-instellingen.");
  }
}

async function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].geometry.location);
      } else {
        reject(new Error(`Locatie niet gevonden: ${address}`));
      }
    });
  });
}

async function refreshMapRoute() {
  const trip = getSelectedTrip();
  if (!map || !trip) {
    return;
  }

  if (!trip.route.length) {
    try {
      const location = await geocodeAddress(trip.destination);
      map.setCenter(location);
      map.setZoom(9);
      new google.maps.Marker({ map, position: location, title: trip.destination });
      setMapStatus("Kaart gecentreerd op bestemming. Voeg routepunten toe voor navigatie.");
    } catch {
      setMapStatus("Bestemming niet gevonden voor kaartweergave.");
    }
    return;
  }

  const points = trip.route.map((stop) => `${stop.stop}, ${trip.destination}`);
  const waypoints = points.slice(1, -1).map((location) => ({ location, stopover: true }));

  directionsService.route(
    {
      origin: points[0],
      destination: points[points.length - 1],
      waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        setMapStatus("Route bijgewerkt op basis van je stops.");
      } else {
        setMapStatus("Route kon niet berekend worden. Controleer stopnamen.");
      }
    }
  );
}

function render() {
  const trip = getSelectedTrip();
  state.selectedTripId = trip.id;
  renderTripOptions();
  renderTripSummary(trip);
  renderMembers(trip);
  renderCategories(trip);
  renderRoute(trip);
  refreshInspiration();
  refreshMapRoute();
  persist();
}

refs.tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = createTrip(refs.tripName.value.trim(), refs.tripDestination.value.trim());
  state.trips.push(trip);
  state.selectedTripId = trip.id;
  refs.tripForm.reset();
  render();
});

refs.tripSelect.addEventListener("change", () => {
  state.selectedTripId = refs.tripSelect.value;
  render();
});

refs.memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = getSelectedTrip();
  trip.members.push(refs.memberName.value.trim());
  refs.memberForm.reset();
  renderMembers(trip);
  renderTripSummary(trip);
  persist();
});

refs.itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = getSelectedTrip();
  trip.items[refs.itemCategory.value].push({
    title: refs.itemTitle.value.trim(),
    notes: refs.itemNotes.value.trim()
  });
  refs.itemForm.reset();
  renderCategories(trip);
  renderTripSummary(trip);
  persist();
});

refs.routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = getSelectedTrip();
  trip.route.push({
    day: refs.routeDay.value.trim(),
    stop: refs.routeStop.value.trim(),
    time: refs.routeTime.value.trim()
  });
  refs.routeForm.reset();
  renderRoute(trip);
  renderTripSummary(trip);
  refreshMapRoute();
  persist();
});

refs.saveApiKey.addEventListener("click", async () => {
  const key = refs.mapsApiKey.value.trim();
  if (!key) {
    return;
  }

  localStorage.setItem(MAPS_KEY_STORAGE, key);
  refs.mapsApiKey.value = "";
  await initializeMap();
});

refs.refreshInspiration.addEventListener("click", () => {
  refreshInspiration();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {
    // Stil falen: app werkt ook zonder service worker.
  });
}

renderCategorySelect();
render();
initializeMap();
