/**
 * Recursively checks if a data object contains any `{{placeholder}}` strings
 * from custom block slots. When placeholders are present, Zod schema validation
 * fails on strict fields (e.g. color hex regex), so sidebar panels should skip
 * validation and pass data through directly.
 */
export default function containsPlaceholders(obj: unknown): boolean {
  if (typeof obj === 'string') {
    return /\{\{\w+\}\}/.test(obj);
  }
  if (Array.isArray(obj)) {
    return obj.some(containsPlaceholders);
  }
  if (obj && typeof obj === 'object') {
    return Object.values(obj).some(containsPlaceholders);
  }
  return false;
}
