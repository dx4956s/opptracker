export function parseNumericValue(value: string, fallback = 0): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || fallback;
}
