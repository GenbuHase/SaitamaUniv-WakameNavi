/**
 * vue-router の LocationQueryValue を NuxtLink / navigateTo 向けの
 * string | string[] | null | undefined に正規化する。
 */
export function normalizeQueryValue(
  value: string | null | (string | null)[] | undefined
): string | string[] | null | undefined {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return value;
}
