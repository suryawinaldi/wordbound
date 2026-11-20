import { useSyncExternalStore } from "react";
const key = "hunt.activity.v1";
let revision = 0;
const listeners = new Set();
export function activities() {
  try { const data = JSON.parse(localStorage.getItem(key)); return Array.isArray(data) ? data.filter(item => item && typeof item.id === "string" && Number.isFinite(item.correct)) : []; } catch { return []; }
}
export function recordActivity(item) {
  const data = activities();
  if (data.some(entry => entry.id === item.id)) return;
  try {
    localStorage.setItem(key, JSON.stringify([...data, item]));
    revision++;
    listeners.forEach(listener => listener());
  } catch {}
}
export function useActivities() {
  useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => revision);
  return activities();
}
