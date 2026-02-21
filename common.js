const STORAGE_KEY = "travelapp-state-v5";
const LEGACY_STORAGE_KEYS = ["travelapp-state-v4", "travelapp-state-v3", "travelapp-state-v2"];
const USERS_KEY = "travelapp-users-v1";
const SESSION_KEY = "travelapp-session-v1";

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

const voteTypes = ["must", "maybe", "skip"];

function getCurrentUser() {
  return localStorage.getItem(SESSION_KEY) || "";
}

function ensureDefaultUsers() {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) {
    return;
  }

  const users = [
    { username: "jij", password: "reis123" },
    { username: "partner", password: "reis123" }
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function authenticate(username, password) {
  ensureDefaultUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const found = users.find((user) => user.username === username.toLowerCase() && user.password === password);
  if (!found) {
    return false;
  }

  localStorage.setItem(SESSION_KEY, found.username);
  return true;
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

function enforceAuth() {
  const path = window.location.pathname;
  if (path.endsWith("login.html")) {
    return;
  }

  if (!getCurrentUser()) {
    window.location.href = "login.html";
  }
}

function createItem(title, notes) {
  return {
    id: crypto.randomUUID(),
    title,
    notes,
    createdBy: getCurrentUser() || "onbekend",
    createdAt: new Date().toISOString(),
    voters: {}
  };
}

function createTrip(name, destination) {
  return {
    id: crypto.randomUUID(),
    name,
    destination,
    members: [],
    items: categories.reduce((acc, category) => ({ ...acc, [category]: [] }), {}),
    route: [],
    dayPlan: [],
    customLinks: []
  };
}

function normalizeItem(item) {
  const normalized = {
    id: item.id || crypto.randomUUID(),
    title: item.title || "Onbekend",
    notes: item.notes || "",
    createdBy: item.createdBy || "onbekend",
    createdAt: item.createdAt || new Date().toISOString(),
    voters: item.voters || {}
  };

  voteTypes.forEach((type) => {
    if (typeof normalized.voters[type] === "number") {
      delete normalized.voters[type];
    }
  });

  return normalized;
}

function normalizeTrip(trip) {
  const normalized = {
    ...trip,
    members: trip.members || [],
    route: (trip.route || []).map((entry) => ({
      ...entry,
      createdBy: entry.createdBy || "onbekend",
      createdAt: entry.createdAt || new Date().toISOString()
    })),
    dayPlan: (trip.dayPlan || []).map((entry) => ({
      ...entry,
      createdBy: entry.createdBy || "onbekend",
      createdAt: entry.createdAt || new Date().toISOString()
    })),
    customLinks: (trip.customLinks || []).map((entry) => ({
      id: entry.id || crypto.randomUUID(),
      title: entry.title || "Onbekende link",
      url: entry.url || "#",
      notes: entry.notes || "",
      createdBy: entry.createdBy || "onbekend",
      createdAt: entry.createdAt || new Date().toISOString()
    })),
    items: trip.items || {}
  };

  categories.forEach((category) => {
    normalized.items[category] = (normalized.items[category] || []).map(normalizeItem);
  });

  return normalized;
}

function readSavedState() {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    const saved = localStorage.getItem(key);
    if (saved) {
      return saved;
    }
  }
  return null;
}

function loadState() {
  const saved = readSavedState();
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.trips = (parsed.trips || []).map(normalizeTrip);
    if (!parsed.trips.length) {
      const starter = createTrip("Voorbeeldreis", "Toscane, Italië");
      parsed.trips = [starter];
      parsed.selectedTripId = starter.id;
    }
    return parsed;
  }

  const starter = createTrip("Voorbeeldreis", "Toscane, Italië");
  starter.members = ["jij", "partner"];
  starter.items.Highlights.push(createItem("San Gimignano", "Mooie torenstad"));
  starter.route.push({ day: "Dag 1", stop: "Florence", time: "09:00", createdBy: "jij", createdAt: new Date().toISOString() });
  starter.dayPlan.push({ day: "Dag 1", period: "Ochtend", activity: "Koffie + oude centrum", location: "Florence", travelMinutes: 20, createdBy: "jij", createdAt: new Date().toISOString() });
  starter.customLinks.push({ id: crypto.randomUUID(), title: "Gezinsblog Toscane", url: "https://example.com/toscane", notes: "Leuke tips voor dorpjes", createdBy: "jij", createdAt: new Date().toISOString() });

  return {
    selectedTripId: starter.id,
    trips: [starter]
  };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSelectedTrip() {
  return state.trips.find((trip) => trip.id === state.selectedTripId) || state.trips[0];
}

function setSelectedTripId(id) {
  state.selectedTripId = id;
  saveState();
}

function syncTripSelect(selectEl) {
  const trip = getSelectedTrip();
  state.selectedTripId = trip.id;
  selectEl.innerHTML = "";

  state.trips.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = `${entry.name} · ${entry.destination}`;
    selectEl.append(option);
  });

  selectEl.value = state.selectedTripId;
}

function addTrip(name, destination) {
  const trip = createTrip(name, destination);
  state.trips.push(trip);
  state.selectedTripId = trip.id;
  saveState();
  return trip;
}

function addMember(name) {
  const trip = getSelectedTrip();
  trip.members.push(name.toLowerCase());
  saveState();
}

function addItem(category, title, notes) {
  const trip = getSelectedTrip();
  trip.items[category].push(createItem(title, notes));
  saveState();
}

function castVote(category, itemId, voteType) {
  if (!voteTypes.includes(voteType)) {
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    return;
  }

  const trip = getSelectedTrip();
  const item = (trip.items[category] || []).find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  item.voters[user] = voteType;
  saveState();
}

function getVoteCounts(item) {
  const counts = { must: 0, maybe: 0, skip: 0 };
  Object.values(item.voters || {}).forEach((value) => {
    if (counts[value] !== undefined) {
      counts[value] += 1;
    }
  });
  return counts;
}

function addRouteStop(day, stop, time) {
  const trip = getSelectedTrip();
  trip.route.push({ day, stop, time, createdBy: getCurrentUser() || "onbekend", createdAt: new Date().toISOString() });
  saveState();
}

function addDayPlanBlock(day, period, activity, location, travelMinutes) {
  const trip = getSelectedTrip();
  trip.dayPlan.push({
    day,
    period,
    activity,
    location,
    travelMinutes: Number(travelMinutes) || 0,
    createdBy: getCurrentUser() || "onbekend",
    createdAt: new Date().toISOString()
  });
  saveState();
}


function addCustomInspirationLink(title, url, notes) {
  const trip = getSelectedTrip();
  trip.customLinks.push({
    id: crypto.randomUUID(),
    title,
    url,
    notes,
    createdBy: getCurrentUser() || "onbekend",
    createdAt: new Date().toISOString()
  });
  saveState();
}

function renderUserBadge() {
  const userEl = document.getElementById("current-user");
  const logoutBtn = document.getElementById("logout-btn");
  if (userEl) {
    userEl.textContent = `Ingelogd als: ${getCurrentUser() || "-"}`;
  }
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
}

window.TravelApp = {
  categories,
  voteTypes,
  getState: () => state,
  getSelectedTrip,
  setSelectedTripId,
  syncTripSelect,
  addTrip,
  addMember,
  addItem,
  castVote,
  getVoteCounts,
  addRouteStop,
  addDayPlanBlock,
  addCustomInspirationLink,
  getCurrentUser,
  authenticate,
  logout,
  saveState,
  renderUserBadge,
  ensureDefaultUsers
};

enforceAuth();
renderUserBadge();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
