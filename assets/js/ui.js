export function getUi() {
  return {
    datasetStatus: document.querySelector("#dataset-status"),
    languageButtons: document.querySelectorAll("[data-language]"),
    languageSwitcher: document.querySelector("#language-switcher"),
    message: document.querySelector("#message"),
    metaDescription: document.querySelector('meta[name="description"]'),
    resultCard: document.querySelector("#result-card"),
    resultGroup: document.querySelector("#result-group"),
    resultName: document.querySelector("#result-name"),
    searchForm: document.querySelector("#search-form"),
    searchInput: document.querySelector("#guest-search"),
    suggestionsList: document.querySelector("#suggestions"),
    translatableText: document.querySelectorAll("[data-i18n]"),
  };
}

export function applyTranslations(ui, language, translate) {
  document.documentElement.lang = language;
  ui.metaDescription.content = translate("meta.description");
  ui.searchInput.placeholder = translate("search.placeholder");
  ui.suggestionsList.setAttribute(
    "aria-label",
    translate("suggestions.ariaLabel"),
  );
  ui.languageSwitcher.setAttribute(
    "aria-label",
    translate("language.switcherLabel"),
  );

  ui.translatableText.forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  ui.languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language;
    const languageName = translate(`language.${button.dataset.language}`);

    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-label", languageName);
    button.title = languageName;
  });
}

export function setDatasetStatus(status, text) {
  status.textContent = text;
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

export function setMessage(message, text, type = "neutral") {
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
