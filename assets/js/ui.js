export function getUi() {
  return {
    datasetStatus: document.querySelector("#dataset-status"),
    message: document.querySelector("#message"),
    resultCard: document.querySelector("#result-card"),
    resultGroup: document.querySelector("#result-group"),
    resultName: document.querySelector("#result-name"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#guest-search"),
    suggestionsList: document.querySelector("#suggestions"),
  };
}

export function setDatasetStatus(count) {
  const status = document.querySelector("#dataset-status");

  if (typeof count === "string") {
    status.textContent = count;
    return;
  }

  if (count === 0) {
    status.textContent = "No guest data available.";
    return;
  }

  status.textContent = `${count} guest(s) loaded.`;
}

export function renderSuggestions(list, suggestions, activeIndex) {
  list.replaceChildren();
  list.hidden = suggestions.length === 0;

  suggestions.forEach((guest, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const name = document.createElement("span");
    const group = document.createElement("span");

    item.id = `suggestion-${index}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(index === activeIndex));

    button.type = "button";
    button.className = "suggestion-button";
    button.dataset.suggestionIndex = String(index);

    name.className = "suggestion-name";
    name.textContent = guest.displayName;

    group.className = "suggestion-group";
    group.textContent = guest.group;

    button.append(name, group);
    item.append(button);
    list.append(item);
  });
}

export function showResult(card, guest) {
  document.querySelector("#result-name").textContent = guest.displayName;
  document.querySelector("#result-group").textContent = guest.group;
  card.hidden = false;
}

export function hideResult(card) {
  card.hidden = true;
}

export function setMessage(text, type = "neutral") {
  const message = document.querySelector("#message");

  message.textContent = text;
  message.className = `message ${type === "error" ? "is-error" : ""} ${
    type === "success" ? "is-success" : ""
  }`.trim();
}

export function clearMessage(message) {
  message.textContent = "";
  message.className = "message";
}

export function setSearchExpanded(input, isExpanded, activeIndex = -1) {
  input.setAttribute("aria-expanded", String(isExpanded));

  if (isExpanded && activeIndex >= 0) {
    input.setAttribute("aria-activedescendant", `suggestion-${activeIndex}`);
    return;
  }

  input.removeAttribute("aria-activedescendant");
}
