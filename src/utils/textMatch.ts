/**
 * Comparison key for user-typed labels: trimmed, inner whitespace collapsed, lower-cased with Turkish rules
 * ("I" -> "ı", "İ" -> "i"). Mirrors the backend TagNameUtils rule, so a tag the UI treats as existing is
 * also the one the server reuses.
 */
export const normalizeForMatch = (text: string): string =>
  text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr')

export const isSameText = (a: string, b: string): boolean => normalizeForMatch(a) === normalizeForMatch(b)
