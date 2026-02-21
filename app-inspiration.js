const fallbackInspiration = {
  blogs: [
    "Gebruik 'Lonely Planet + bestemming + family travel' voor extra blogs.",
    "Zoek op YouTube: 'destination family itinerary' voor dagroutes.",
    "Check kindvriendelijke reisblogs voor concrete dagplanning."
  ],
  social: [
    "Zoek op #familytravel + bestemming op Instagram/TikTok.",
    "Bekijk Reddit threads voor up-to-date ervaringen.",
    "Sla interessante reels op in Highlights of Eten & drinken."
  ]
};

const refs = {
  tripSelect: document.getElementById("trip-select"),
  refreshBtn: document.getElementById("refresh-inspiration"),
  quickCategory: document.getElementById("quick-category"),
  quickDay: document.getElementById("quick-day"),
  customLinkForm: document.getElementById("custom-link-form"),
  customLinkTitle: document.getElementById("custom-link-title"),
  customLinkUrl: document.getElementById("custom-link-url"),
  customLinkNotes: document.getElementById("custom-link-notes"),
  savedLinkList: document.getElementById("saved-link-list"),
  blogList: document.getElementById("blog-list"),
  socialList: document.getElementById("social-list")
};

function renderCategorySelect() {
  refs.quickCategory.innerHTML = "";
  TravelApp.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    refs.quickCategory.append(option);
  });
}

function renderSavedLinks() {
  const trip = TravelApp.getSelectedTrip();
  refs.savedLinkList.innerHTML = "";

  if (!trip.customLinks.length) {
    refs.savedLinkList.innerHTML = "<li class='muted'>Nog geen eigen links opgeslagen voor deze reis.</li>";
    return;
  }

  trip.customLinks
    .slice()
    .reverse()
    .forEach((entry) => {
      const li = document.createElement("li");
      li.className = "item-card";
      li.innerHTML = `<a href="${entry.url}" target="_blank" rel="noopener noreferrer">${entry.title}</a>${entry.notes ? `<br><span class='muted'>${entry.notes}</span>` : ""}<br><span class='muted'>Toegevoegd door ${entry.createdBy}</span>`;
      refs.savedLinkList.append(li);
    });
}

async function fetchWikipediaInspiration(destination) {
  const url = `https://nl.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(`${destination} reis`)}&limit=5&namespace=0&format=json&origin=*`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Wikipedia niet beschikbaar");
  }

  const data = await response.json();
  return data[1].map((title, index) => ({
    title,
    description: data[2][index] || "Wikipedia artikel",
    url: data[3][index]
  }));
}

async function fetchRedditInspiration(destination) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(`${destination} travel itinerary`)}&sort=hot&t=month&limit=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Reddit niet beschikbaar");
  }

  const data = await response.json();
  return data.data.children.map((item) => ({
    title: item.data.title,
    score: item.data.score,
    url: `https://www.reddit.com${item.data.permalink}`
  }));
}

function buildInspirationItem(item, type) {
  const li = document.createElement("li");
  li.className = "item-card";

  const link = document.createElement("a");
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = item.title;

  const detail = document.createElement("span");
  detail.className = "muted";
  detail.textContent = type === "blog" ? (item.description || "Live bron") : `Score: ${item.score ?? "n.v.t."}`;

  const actions = document.createElement("div");
  actions.className = "vote-row";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Opslaan in database";
  saveBtn.addEventListener("click", () => {
    const category = refs.quickCategory.value || "Highlights";
    TravelApp.addItem(category, item.title, item.url);
    saveBtn.textContent = "Opgeslagen ✓";
  });

  const routeBtn = document.createElement("button");
  routeBtn.type = "button";
  routeBtn.textContent = "Naar route";
  routeBtn.addEventListener("click", () => {
    TravelApp.addRouteStop(refs.quickDay.value.trim() || "Dag 1", item.title, "");
    routeBtn.textContent = "Route ✓";
  });

  actions.append(saveBtn, routeBtn);
  li.append(link, document.createElement("br"), detail, actions);
  return li;
}

function renderLists(blogs, socials) {
  refs.blogList.innerHTML = "";
  refs.socialList.innerHTML = "";

  blogs.forEach((item) => {
    refs.blogList.append(buildInspirationItem(item, "blog"));
  });

  socials.forEach((item) => {
    refs.socialList.append(buildInspirationItem(item, "social"));
  });
}

async function refreshInspiration() {
  TravelApp.renderUserBadge();
  TravelApp.syncTripSelect(refs.tripSelect);
  const trip = TravelApp.getSelectedTrip();
  renderSavedLinks();

  refs.blogList.innerHTML = "<li class='muted'>Zoeken naar blogs & artikelen...</li>";
  refs.socialList.innerHTML = "<li class='muted'>Zoeken naar trends...</li>";

  try {
    const [blogs, socials] = await Promise.all([
      fetchWikipediaInspiration(trip.destination),
      fetchRedditInspiration(trip.destination)
    ]);

    renderLists(
      blogs.length ? blogs : fallbackInspiration.blogs.map((title) => ({ title, url: "#" })),
      socials.length ? socials : fallbackInspiration.social.map((title) => ({ title, url: "#" }))
    );
  } catch {
    renderLists(
      fallbackInspiration.blogs.map((title) => ({ title, description: "Fallback tip", url: "#" })),
      fallbackInspiration.social.map((title) => ({ title, score: "Fallback", url: "#" }))
    );
  }
}

refs.tripSelect.addEventListener("change", () => {
  TravelApp.setSelectedTripId(refs.tripSelect.value);
  refreshInspiration();
});

refs.customLinkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addCustomInspirationLink(
    refs.customLinkTitle.value.trim(),
    refs.customLinkUrl.value.trim(),
    refs.customLinkNotes.value.trim()
  );
  refs.customLinkForm.reset();
  renderSavedLinks();
});

refs.refreshBtn.addEventListener("click", refreshInspiration);

renderCategorySelect();
refreshInspiration();
