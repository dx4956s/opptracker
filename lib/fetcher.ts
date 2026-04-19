import { notifyRequestEnd, notifyRequestStart } from "@/lib/requestEvents";

// All fetches use credentials: "include" so the HttpOnly session cookie
// is sent automatically. No Authorization header or token handling needed.

export const fetcher = async (url: string) => {
  notifyRequestStart();
  try {
    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Request failed");
    return data;
  } finally {
    notifyRequestEnd();
  }
};

// Authenticated fetcher for useSWR hooks
export const authedFetcher = fetcher;

// Generic authenticated API call for mutations
export function apiFetch(
  url: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<unknown> {
  const { json, ...rest } = options;

  notifyRequestStart();

  return fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  })
    .then(async (res) => {
      if (res.status === 204) return null;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      return data;
    })
    .finally(() => {
      notifyRequestEnd();
    });
}
