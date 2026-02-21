const refs = {
  tripSelect: document.getElementById("trip-select"),
  itemForm: document.getElementById("item-form"),
  itemCategory: document.getElementById("item-category"),
  itemTitle: document.getElementById("item-title"),
  itemNotes: document.getElementById("item-notes"),
  categoryColumns: document.getElementById("category-columns")
};

function renderCategorySelect() {
  refs.itemCategory.innerHTML = "";
  TravelApp.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    refs.itemCategory.append(option);
  });
}

function voteButton(label, type, category, itemId, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `vote vote-${type}`;
  button.textContent = `${label} (${count})`;
  button.addEventListener("click", () => {
    TravelApp.castVote(category, itemId, type);
    render();
  });
  return button;
}

function render() {
  TravelApp.renderUserBadge();
  TravelApp.syncTripSelect(refs.tripSelect);
  const trip = TravelApp.getSelectedTrip();
  refs.categoryColumns.innerHTML = "";

  TravelApp.categories.forEach((category) => {
    const card = document.createElement("article");
    card.className = "category";
    card.innerHTML = `<h3>${category}</h3>`;

    const list = document.createElement("ul");
    const items = trip.items[category] || [];
    if (!items.length) {
      list.innerHTML = "<li class='muted'>Nog niets opgeslagen.</li>";
    } else {
      items.forEach((item) => {
        const counts = TravelApp.getVoteCounts(item);
        const li = document.createElement("li");
        li.className = "item-card";

        const meta = document.createElement("div");
        meta.innerHTML = `<strong>${item.title}</strong>${item.notes ? `<br><span class='muted'>${item.notes}</span>` : ""}<br><span class='muted'>Toegevoegd door: ${item.createdBy}</span>`;

        const votes = document.createElement("div");
        votes.className = "vote-row";
        votes.append(
          voteButton("Must", "must", category, item.id, counts.must),
          voteButton("Maybe", "maybe", category, item.id, counts.maybe),
          voteButton("Skip", "skip", category, item.id, counts.skip)
        );

        li.append(meta, votes);
        list.append(li);
      });
    }

    card.append(list);
    refs.categoryColumns.append(card);
  });
}

refs.tripSelect.addEventListener("change", () => {
  TravelApp.setSelectedTripId(refs.tripSelect.value);
  render();
});

refs.itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  TravelApp.addItem(refs.itemCategory.value, refs.itemTitle.value.trim(), refs.itemNotes.value.trim());
  refs.itemForm.reset();
  render();
});

renderCategorySelect();
render();
