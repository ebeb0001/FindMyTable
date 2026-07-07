import { parseGuestCsv } from "./csv.js";
import {
  getInitialLanguage,
  isSupportedLanguage,
  setStoredLanguage,
  translate,
} from "./i18n.js";
import { createSearchIndex, findSuggestions, normalizeText } from "./search.js";
import {
  applyTranslations,
  clearMessage,
  getUi,
  hideResult,
  renderSuggestions,
  setDatasetStatus,
  setMessage,
  setSearchExpanded,
  showResult,
} from "./ui.js";

const GUESTS_CSV_URL = "./data/guests.csv";

const ui = getUi();

const state = {
  language: getInitialLanguage(),
  isLoading: true,
  loadErrorDetail: "",
  message: null,
  guests: [],
  suggestions: [],
  activeSuggestionIndex: -1,
};

init();

function init() {
  applyCurrentLanguage();
  bindEvents();
  loadGuestsFromCsv();
}

function bindEvents() {
  ui.languageButtons.forEach((button) => {
    button.addEventListener("click", handleLanguageChange);
  });
  ui.searchInput.addEventListener("input", handleSearchInput);
  ui.searchInput.addEventListener("keydown", handleSearchKeydown);
  ui.searchForm.addEventListener("submit", handleSearchSubmit);
  ui.suggestionsList.addEventListener("click", handleSuggestionClick);
}

async function loadGuestsFromCsv() {
  state.isLoading = true;
  state.loadErrorDetail = "";
  updateDatasetStatus();

  try {
    const response = await fetch(GUESTS_CSV_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP response ${response.status}`);
    }

    const content = await response.text();
    const parsed = parseGuestCsv(content);

    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    state.guests = createSearchIndex(parsed.guests);
    updateDatasetStatus();
    clearLocalizedMessage();
  } catch (error) {
    state.guests = [];
    state.loadErrorDetail = error.message;
    updateDatasetStatus();
    setLocalizedMessage("message.loadFailed", "error", {
      detail: state.loadErrorDetail,
    });
  } finally {
    state.isLoading = false;
    updateDatasetStatus();
    updateSearchState();
  }
}

function handleLanguageChange(event) {
  const language = event.currentTarget.dataset.language;

  if (!isSupportedLanguage(language) || language === state.language) {
    return;
  }

  state.language = language;
  setStoredLanguage(language);
  applyCurrentLanguage();
  updateDatasetStatus();
  renderStoredMessage();
  renderCurrentSuggestions();
}

function handleSearchInput() {
  updateSearchState();
}

function handleSearchSubmit(event) {
  event.preventDefault();

  const query = ui.searchInput.value;
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    setLocalizedMessage("message.enterName", "error");
    hideResult(ui.resultCard);
    return;
  }

  if (state.isLoading) {
    setLocalizedMessage("message.stillLoading", "error");
    hideResult(ui.resultCard);
    return;
  }

  if (state.loadErrorDetail) {
    setLocalizedMessage("message.loadFailed", "error", {
      detail: state.loadErrorDetail,
    });
    hideResult(ui.resultCard);
    return;
  }

  if (!hasGuests()) {
    setLocalizedMessage("message.noGuestData", "error");
    hideResult(ui.resultCard);
    return;
  }

  const exactGuest = state.guests.find(
    (guest) => guest.searchName === normalizedQuery,
  );

  if (exactGuest) {
    selectGuest(exactGuest);
    return;
  }

  if (state.suggestions.length > 0) {
    setLocalizedMessage("message.selectSuggestion", "error");
    return;
  }

  setLocalizedMessage("message.noResult", "error");
  hideResult(ui.resultCard);
}

function handleSearchKeydown(event) {
  if (state.suggestions.length === 0) {
    return;
  }

  const keyActions = {
    ArrowDown: () => moveActiveSuggestion(1),
    ArrowUp: () => moveActiveSuggestion(-1),
    Enter: () => selectActiveSuggestion(),
    Escape: () => clearSuggestions(),
  };

  const action = keyActions[event.key];

  if (!action) {
    return;
  }

  event.preventDefault();
  action();
}

function handleSuggestionClick(event) {
  const button = event.target.closest("[data-suggestion-index]");

  if (!button) {
    return;
  }

  const suggestion = state.suggestions[Number(button.dataset.suggestionIndex)];

  if (suggestion) {
    selectGuest(suggestion);
  }
}

function updateSearchState() {
  const query = ui.searchInput.value;
  const normalizedQuery = normalizeText(query);

  hideResult(ui.resultCard);

  if (state.isLoading) {
    clearSuggestions();
    if (normalizedQuery) {
      setLocalizedMessage("message.stillLoading", "error");
    }
    return;
  }

  if (state.loadErrorDetail) {
    clearSuggestions();
    setLocalizedMessage("message.loadFailed", "error", {
      detail: state.loadErrorDetail,
    });
    return;
  }

  if (!hasGuests()) {
    clearSuggestions();
    if (normalizedQuery) {
      setLocalizedMessage("message.noGuestData", "error");
    } else {
      clearLocalizedMessage();
    }
    return;
  }

  if (!normalizedQuery) {
    clearSuggestions();
    clearLocalizedMessage();
    return;
  }

  if (normalizedQuery.length < 2) {
    clearSuggestions();
    setLocalizedMessage("message.minChars", "error");
    return;
  }

  state.suggestions = findSuggestions(state.guests, normalizedQuery);
  state.activeSuggestionIndex = -1;
  renderCurrentSuggestions();

  if (state.suggestions.length === 0) {
    setLocalizedMessage("message.noResult", "error");
    return;
  }

  clearLocalizedMessage();
}

function moveActiveSuggestion(direction) {
  const maxIndex = state.suggestions.length - 1;
  const nextIndex = state.activeSuggestionIndex + direction;

  if (nextIndex < 0) {
    state.activeSuggestionIndex = maxIndex;
  } else if (nextIndex > maxIndex) {
    state.activeSuggestionIndex = 0;
  } else {
    state.activeSuggestionIndex = nextIndex;
  }

  renderCurrentSuggestions();
}

function selectActiveSuggestion() {
  const index =
    state.activeSuggestionIndex === -1 ? 0 : state.activeSuggestionIndex;
  const suggestion = state.suggestions[index];

  if (suggestion) {
    selectGuest(suggestion);
  }
}

function selectGuest(guest) {
  ui.searchInput.value = guest.displayName;
  clearSuggestions();
  clearLocalizedMessage();
  showResult(ui.resultCard, guest);
}

function renderCurrentSuggestions() {
  renderSuggestions(
    ui.suggestionsList,
    state.suggestions,
    state.activeSuggestionIndex,
  );
  setSearchExpanded(
    ui.searchInput,
    state.suggestions.length > 0,
    state.activeSuggestionIndex,
  );
}

function clearSuggestions() {
  state.suggestions = [];
  state.activeSuggestionIndex = -1;
  renderCurrentSuggestions();
}

function hasGuests() {
  return state.guests.length > 0;
}

function applyCurrentLanguage() {
  applyTranslations(ui, state.language, t);
}

function updateDatasetStatus() {
  if (state.isLoading) {
    setDatasetStatus(ui.datasetStatus, t("status.loading"));
    return;
  }

  if (state.loadErrorDetail) {
    setDatasetStatus(ui.datasetStatus, t("status.unavailable"));
    return;
  }

  if (state.guests.length === 0) {
    setDatasetStatus(ui.datasetStatus, t("status.empty"));
    return;
  }

  const loadedStatusKey =
    state.guests.length === 1 ? "status.loadedOne" : "status.loadedMany";

  setDatasetStatus(
    ui.datasetStatus,
    t(loadedStatusKey, { count: state.guests.length }),
  );
}

function setLocalizedMessage(key, type = "neutral", values = {}) {
  state.message = { key, type, values };
  setMessage(ui.message, t(key, values), type);
}

function renderStoredMessage() {
  if (!state.message) {
    clearMessage(ui.message);
    return;
  }

  setMessage(
    ui.message,
    t(state.message.key, state.message.values),
    state.message.type,
  );
}

function clearLocalizedMessage() {
  state.message = null;
  clearMessage(ui.message);
}

function t(key, values) {
  return translate(state.language, key, values);
}
