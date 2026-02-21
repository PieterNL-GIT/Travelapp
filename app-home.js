const refs = {
  tripSelect: document.getElementById("trip-select"),
  tripForm: document.getElementById("trip-form"),
  tripName: document.getElementById("trip-name"),
  tripDestination: document.getElementById("trip-destination"),
  tripSummary: document.getElementById("trip-summary"),
  memberForm: document.getElementById("member-form"),
  memberName: document.getElementById("member-name"),
  memberList: document.getElementById("member-list")
};

function render() {
  TravelApp.renderUserBadge();
  TravelApp.syncTripSelect(refs.tripSelect);
  const trip = TravelApp.getSelectedTrip();
  refs.tripSummary.textContent = `Actieve reis: ${trip.name} (${trip.destination}) · ${trip.members.length} reisgenoten · ${trip.route.length} routepunten.`;

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

refs.tripSelect.addEventListener("change", () => {
  TravelApp.setSelectedTripId(refs.tripSelect.value);
  render();
});

refs.tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addTrip(refs.tripName.value.trim(), refs.tripDestination.value.trim());
  refs.tripForm.reset();
  render();
});

refs.memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addMember(refs.memberName.value.trim());
  refs.memberForm.reset();
  render();
});

render();
