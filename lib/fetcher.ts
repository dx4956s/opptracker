// All fetches use credentials: "include" so the HttpOnly session cookie
// is sent automatically. No Authorization header or token handling needed.

export const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Request failed");
    return data;
  });

// Authenticated fetcher for useSWR hooks
export const authedFetcher = fetcher;

// Generic authenticated API call for mutations
export function apiFetch(
  url: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<unknown> {
  const { json, ...rest } = options;

  return fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  }).then(async (res) => {
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Request failed");
    return data;
  });
}
