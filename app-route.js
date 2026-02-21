const MAPS_KEY_STORAGE = "travelapp-google-maps-key";

const refs = {
  tripSelect: document.getElementById("trip-select"),
  routeForm: document.getElementById("route-form"),
  routeDay: document.getElementById("route-day"),
  routeStop: document.getElementById("route-stop"),
  routeTime: document.getElementById("route-time"),
  routeList: document.getElementById("route-list"),
  map: document.getElementById("map"),
  mapStatus: document.getElementById("map-status"),
  mapsApiKey: document.getElementById("maps-api-key"),
  saveApiKey: document.getElementById("save-api-key"),
  dayPlanForm: document.getElementById("day-plan-form"),
  planDay: document.getElementById("plan-day"),
  planPeriod: document.getElementById("plan-period"),
  planActivity: document.getElementById("plan-activity"),
  planLocation: document.getElementById("plan-location"),
  planTravel: document.getElementById("plan-travel"),
  dayPlanWarning: document.getElementById("day-plan-warning"),
  dayPlanList: document.getElementById("day-plan-list")
};

let map;
let geocoder;
let directionsService;
let directionsRenderer;

function setMapStatus(message) {
  refs.mapStatus.textContent = message;
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
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google Maps script kon niet laden."));
    document.head.append(script);
  });
}

async function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].geometry.location);
      } else {
        reject(new Error("Locatie niet gevonden"));
      }
    });
  });
}

async function refreshMapRoute() {
  const trip = TravelApp.getSelectedTrip();
  if (!map || !trip) {
    return;
  }

  if (!trip.route.length) {
    try {
      const location = await geocodeAddress(trip.destination);
      map.setCenter(location);
      map.setZoom(9);
      new google.maps.Marker({ map, position: location, title: trip.destination });
      setMapStatus("Kaart gecentreerd op bestemming. Voeg routepunten toe voor routeberekening.");
    } catch {
      setMapStatus("Bestemming niet gevonden op kaart.");
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
        setMapStatus("Route bijgewerkt op basis van actieve reis.");
      } else {
        setMapStatus("Route kon niet berekend worden. Controleer namen van stops.");
      }
    }
  );
}

async function initMap() {
  const apiKey = localStorage.getItem(MAPS_KEY_STORAGE);
  if (!apiKey) {
    setMapStatus("Voeg je Google Maps API-key toe om de routekaart te activeren.");
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
    directionsRenderer = new google.maps.DirectionsRenderer({ map });
    await refreshMapRoute();
  } catch {
    setMapStatus("Google Maps laden mislukte. Controleer key, APIs en billing.");
  }
}

function renderDayPlan(trip) {
  refs.dayPlanList.innerHTML = "";

  if (!trip.dayPlan.length) {
    refs.dayPlanList.innerHTML = "<p class='muted'>Nog geen dagblokken toegevoegd.</p>";
    refs.dayPlanWarning.textContent = "";
    return;
  }

  const grouped = {};
  trip.dayPlan.forEach((block) => {
    grouped[block.day] = grouped[block.day] || [];
    grouped[block.day].push(block);
  });

  let hasHeavyTravelDay = false;

  Object.entries(grouped).forEach(([day, blocks]) => {
    const container = document.createElement("article");
    container.className = "day-card";

    const totalTravel = blocks.reduce((sum, block) => sum + (Number(block.travelMinutes) || 0), 0);
    if (totalTravel > 180) {
      hasHeavyTravelDay = true;
    }

    const title = document.createElement("h3");
    title.textContent = `${day} · Reistijd totaal: ${totalTravel} min`;
    container.append(title);

    const list = document.createElement("ul");
    blocks.forEach((block) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${block.period}</strong> — ${block.activity}<br><span class='muted'>${block.location} · reistijd ${block.travelMinutes} min · door ${block.createdBy || "onbekend"}</span>`;
      list.append(li);
    });
    container.append(list);
    refs.dayPlanList.append(container);
  });

  refs.dayPlanWarning.textContent = hasHeavyTravelDay
    ? "Waarschuwing: er is een dag met >180 minuten reistijd. Overweeg activiteiten te spreiden."
    : "Planning ziet er realistisch uit qua reistijd.";
}

function renderRouteList() {
  TravelApp.renderUserBadge();
  TravelApp.syncTripSelect(refs.tripSelect);
  const trip = TravelApp.getSelectedTrip();
  refs.routeList.innerHTML = "";

  if (!trip.route.length) {
    refs.routeList.innerHTML = "<li class='muted'>Nog geen routepunten.</li>";
  } else {
    trip.route.forEach((stop, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${idx + 1}. ${stop.day}: ${stop.stop}${stop.time ? ` (${stop.time})` : ""}</strong><br><span class='muted'>Toegevoegd door: ${stop.createdBy || "onbekend"}</span>`;
      refs.routeList.append(li);
    });
  }

  renderDayPlan(trip);
  refreshMapRoute();
}

refs.tripSelect.addEventListener("change", () => {
  TravelApp.setSelectedTripId(refs.tripSelect.value);
  renderRouteList();
});

refs.routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addRouteStop(refs.routeDay.value.trim(), refs.routeStop.value.trim(), refs.routeTime.value.trim());
  refs.routeForm.reset();
  renderRouteList();
});

refs.dayPlanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addDayPlanBlock(
    refs.planDay.value.trim(),
    refs.planPeriod.value,
    refs.planActivity.value.trim(),
    refs.planLocation.value.trim(),
    refs.planTravel.value
  );
  refs.dayPlanForm.reset();
  renderRouteList();
});

refs.saveApiKey.addEventListener("click", async () => {
  const key = refs.mapsApiKey.value.trim();
  if (!key) {
    return;
  }
  localStorage.setItem(MAPS_KEY_STORAGE, key);
  refs.mapsApiKey.value = "";
  await initMap();
});

renderRouteList();
initMap();
