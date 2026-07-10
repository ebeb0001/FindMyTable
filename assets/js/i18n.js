const STORAGE_KEY = "findmytable-language";
const SUPPORTED_LANGUAGES = ["fr", "en"];

const TRANSLATIONS = {
  fr: {
    "meta.description":
      "Application mobile pour retrouver rapidement la table ou le groupe attribué à un invité.",
    "hero.eyebrow": "Plan de table",
    "hero.intro":
      "Recherchez un nom pour afficher rapidement le groupe, la table ou l'information associée à un invité.",
    "search.title": "Recherche d'invité",
    "search.label": "Nom de l'invité",
    "search.placeholder": "ex. Alice Dupont",
    "search.help": "Saisissez au moins 2 caractères.",
    "suggestions.ariaLabel": "Suggestions de noms",
    "result.label": "Vous êtes à",
    "language.switcherLabel": "Changer de langue",
    "language.fr": "Français",
    "language.en": "English",
    "status.loading": "Chargement de la liste des invités...",
    "status.empty": "Aucune donnée invité disponible.",
    "status.loadedOne": "{count} invité chargé.",
    "status.loadedMany": "{count} invités chargés.",
    "status.unavailable": "Liste des invités indisponible.",
    "message.enterName": "Saisissez un nom avant de lancer la recherche.",
    "message.stillLoading": "La liste des invités est encore en cours de chargement.",
    "message.loadFailed":
      "Impossible de charger la liste des invités : {detail}",
    "message.noGuestData": "Aucune donnée invité n'est disponible.",
    "message.minChars": "Saisissez au moins 2 caractères.",
    "message.selectSuggestion":
      "Sélectionnez une suggestion pour afficher le résultat.",
    "message.noResult": "Aucun résultat pour ce nom.",
  },
  en: {
    "meta.description":
      "Mobile-first app to quickly find a guest's assigned table or group.",
    "hero.eyebrow": "Event Finder",
    "hero.intro":
      "Search for a name to quickly display the group, table, or related information for a guest.",
    "search.title": "Guest Search",
    "search.label": "Guest name",
    "search.placeholder": "e.g. Alice Dupont",
    "search.help": "Enter at least 2 characters.",
    "suggestions.ariaLabel": "Name suggestions",
    "result.label": "You are at",
    "language.switcherLabel": "Change language",
    "language.fr": "Français",
    "language.en": "English",
    "status.loading": "Loading the guest list...",
    "status.empty": "No guest data available.",
    "status.loadedOne": "{count} guest loaded.",
    "status.loadedMany": "{count} guests loaded.",
    "status.unavailable": "Guest list unavailable.",
    "message.enterName": "Enter a name before searching.",
    "message.stillLoading": "The guest list is still loading.",
    "message.loadFailed": "Unable to load the guest list: {detail}",
    "message.noGuestData": "No guest data is available.",
    "message.minChars": "Enter at least 2 characters.",
    "message.selectSuggestion": "Select a suggestion to display the result.",
    "message.noResult": "No result for this name.",
  },
};

export function getInitialLanguage() {
  const storedLanguage = readStoredLanguage();

  if (storedLanguage) {
    return storedLanguage;
  }

  const browserLanguage = navigator.language?.toLowerCase() ?? "";

  if (browserLanguage.startsWith("fr")) {
    return "fr";
  }

  return "en";
}

export function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function setStoredLanguage(language) {
  if (!isSupportedLanguage(language)) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Language switching still works for the current session if storage is off.
  }
}

export function translate(language, key, values = {}) {
  const dictionary = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const fallbackDictionary = TRANSLATIONS.en;
  const template = dictionary[key] ?? fallbackDictionary[key] ?? key;

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function readStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    return isSupportedLanguage(storedLanguage) ? storedLanguage : "";
  } catch {
    return "";
  }
}
