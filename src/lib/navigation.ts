export function withSearch(
  path: string,
  current: URLSearchParams,
  updates: Record<string, string | null>,
  preserve = ["range", "compare", "from", "to"],
): string {
  const next = new URLSearchParams();
  for (const key of preserve) {
    const value = current.get(key);
    if (value) next.set(key, value);
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}
