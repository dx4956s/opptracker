export const REQUEST_START_EVENT = "opptracker:request-start";
export const REQUEST_END_EVENT = "opptracker:request-end";

export function notifyRequestStart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REQUEST_START_EVENT));
}

export function notifyRequestEnd() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REQUEST_END_EVENT));
}
