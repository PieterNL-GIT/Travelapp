const STORAGE_KEY = "travelapp-state-v1";
const categories = ["Stad", "Eten", "Museum", "Hotel", "Activiteit"];

const inspirationSeed = {
  default: {
    blogs: [
      "Gezin de Vries: met kinderen 7 dagen op pad in de regio",
      "Backpacken met baby: praktische tips per bestemming",
      "Onze favoriete lokale markten en speeltuinen"
    ],
    socials: [
      "#hiddengems - 42k views deze week",
      "Top 5 foodie spots van lokale creators",
      "Viral routevideo's met dagplanning"
    ]
  },
  italië: {
    blogs: [
      "Gezinsroadtrip Toscane: dorpjes, strand en pizza",
      "Rome met kinderen: wat echt de moeite is",
      "Sicilië in 10 dagen - onze complete route"
    ],
    socials: [
      "#dolcevita routes en uitzichtpunten",
      "Trendy reels: beste pasta buiten toeristische hotspots",
      "TikTok: budgetvriendelijke hotels in Zuid-Italië"
    ]
  },
  japan: {
    blogs: [
      "Met het gezin in Japan: treinpassen slim gebruiken",
      "Kyoto tips met peuter: tempels + rustmomenten",
      "Tokyo foodhallen en kindvriendelijke wijken"
    ],
    socials: [
      "#japantravel trending: sakura spot compilaties",
      "Insta stories: beste ramen under €10",
      "TikTok routes: 5-daagse city + nature combo"
    ]
  }
};

const refs = {
  tripForm: document.getElementById("trip-form"),
  tripName: document.getElementById("trip-name"),
  tripDestination: document.getElementById("trip-destination"),
  tripSelect: document.getElementById("trip-select"),
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
  blogList: document.getElementById("blog-list"),
  socialList: document.getElementById("social-list")
};

let state = loadState();

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
    return JSON.parse(saved);
  }

  const starter = createTrip("Voorbeeldreis", "Italië");
  starter.members = ["Jij", "Je partner"];
  return {
    selectedTripId: starter.id,
    trips: [starter]
  };
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
    option.textContent = `${trip.name} (${trip.destination})`;
    if (trip.id === state.selectedTripId) {
      option.selected = true;
    }
    refs.tripSelect.append(option);
  });
}

function renderMembers(trip) {
  refs.memberList.innerHTML = "";
  trip.members.forEach((member) => {
    const li = document.createElement("li");
    li.textContent = member;
    refs.memberList.append(li);
  });
}

function renderCategories(trip) {
  refs.categoryColumns.innerHTML = "";
  categories.forEach((category) => {
    const block = document.createElement("div");
    block.className = "category";

    const title = document.createElement("h3");
    title.textContent = category;
    block.append(title);

    const list = document.createElement("ul");
    const items = trip.items[category] || [];
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.notes ? `${item.title} — ${item.notes}` : item.title;
      list.append(li);
    });

    if (!items.length) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "Nog niets toegevoegd";
      list.append(li);
    }

    block.append(list);
    refs.categoryColumns.append(block);
  });
}

function renderRoute(trip) {
  refs.routeList.innerHTML = "";
  trip.route.forEach((stop) => {
    const li = document.createElement("li");
    li.textContent = `${stop.day}: ${stop.stop}${stop.time ? ` (${stop.time})` : ""}`;
    refs.routeList.append(li);
  });

  if (!trip.route.length) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "Nog geen routepunten";
    refs.routeList.append(li);
  }
}

function pickInspiration(destination) {
  const key = destination.trim().toLowerCase();
  const content = inspirationSeed[key] || inspirationSeed.default;

  refs.blogList.innerHTML = "";
  refs.socialList.innerHTML = "";

  [...content.blogs].sort(() => Math.random() - 0.5).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    refs.blogList.append(li);
  });

  [...content.socials].sort(() => Math.random() - 0.5).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    refs.socialList.append(li);
  });
}

function render() {
  const trip = getSelectedTrip();
  state.selectedTripId = trip.id;
  renderTripOptions();
  renderMembers(trip);
  renderCategories(trip);
  renderRoute(trip);
  pickInspiration(trip.destination);
  persist();
}

refs.tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.trips.push(createTrip(refs.tripName.value.trim(), refs.tripDestination.value.trim()));
  state.selectedTripId = state.trips[state.trips.length - 1].id;
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
  render();
});

refs.itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = getSelectedTrip();
  const category = refs.itemCategory.value;
  trip.items[category].push({
    title: refs.itemTitle.value.trim(),
    notes: refs.itemNotes.value.trim()
  });
  refs.itemForm.reset();
  render();
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
  render();
});

render();
