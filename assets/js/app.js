import { parseGuestCsv } from "./csv.js";
import { createSearchIndex, findSuggestions, normalizeText } from "./search.js";
import {
  clearMessage,
  getUi,
  hideResult,
  renderSuggestions,
  setDatasetStatus,
  setMessage,
  setSearchExpanded,
  showResult,
} from "./ui.js";

const GUESTS_CSV_URL = "data/guests.csv";

const ui = getUi();

const state = {
  isLoading: true,
  loadError: "",
  guests: [],
  suggestions: [],
  activeSuggestionIndex: -1,
};

init();

function init() {
  bindEvents();
  loadGuestsFromCsv();
}

function bindEvents() {
  ui.searchInput.addEventListener("input", handleSearchInput);
  ui.searchInput.addEventListener("keydown", handleSearchKeydown);
  ui.searchForm.addEventListener("submit", handleSearchSubmit);
  ui.suggestionsList.addEventListener("click", handleSuggestionClick);
}

async function loadGuestsFromCsv() {
  state.isLoading = true;
  state.loadError = "";
  setDatasetStatus("Loading the guest list...");

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
    setDatasetStatus(state.guests.length);
    clearMessage(ui.message);
  } catch (error) {
    state.guests = [];
    state.loadError = `Unable to load the guest list: ${error.message}`;
    setDatasetStatus("Guest list unavailable.");
    setMessage(state.loadError, "error");
  } finally {
    state.isLoading = false;
    updateSearchState();
  }
}

function handleSearchInput() {
  updateSearchState();
}

function handleSearchSubmit(event) {
  event.preventDefault();

  const query = ui.searchInput.value;
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    setMessage("Enter a name before searching.", "error");
    hideResult(ui.resultCard);
    return;
  }

  if (state.isLoading) {
    setMessage("The guest list is still loading.", "error");
    hideResult(ui.resultCard);
    return;
  }

  if (state.loadError) {
    setMessage(state.loadError, "error");
    hideResult(ui.resultCard);
    return;
  }

  if (!hasGuests()) {
    setMessage("No guest data is available.", "error");
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
    setMessage("Select a suggestion to display the result.", "error");
    return;
  }

  setMessage("No result for this name.", "error");
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
      setMessage("The guest list is still loading.", "error");
    }
    return;
  }

  if (state.loadError) {
    clearSuggestions();
    setMessage(state.loadError, "error");
    return;
  }

  if (!hasGuests()) {
    clearSuggestions();
    if (normalizedQuery) {
      setMessage("No guest data is available.", "error");
    } else {
      clearMessage(ui.message);
    }
    return;
  }

  if (!normalizedQuery) {
    clearSuggestions();
    clearMessage(ui.message);
    return;
  }

  if (normalizedQuery.length < 2) {
    clearSuggestions();
    setMessage("Enter at least 2 characters.", "error");
    return;
  }

  state.suggestions = findSuggestions(state.guests, normalizedQuery);
  state.activeSuggestionIndex = -1;
  renderCurrentSuggestions();

  if (state.suggestions.length === 0) {
    setMessage("No result for this name.", "error");
    return;
  }

  clearMessage(ui.message);
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
  clearMessage(ui.message);
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
