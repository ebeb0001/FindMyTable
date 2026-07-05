const DIACRITIC_REGEX = /[\u0300-\u036f]/g;
const SPACE_REGEX = /\s+/g;
const DEFAULT_SUGGESTION_LIMIT = 5;

export function createSearchIndex(guests) {
  return guests.map((guest) => ({
    ...guest,
    searchName: normalizeText(guest.displayName),
  }));
}

export function findSuggestions(guests, query, limit = DEFAULT_SUGGESTION_LIMIT) {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return guests
    .filter((guest) => guest.searchName.includes(normalizedQuery))
    .slice(0, limit);
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(DIACRITIC_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(SPACE_REGEX, " ");
}
