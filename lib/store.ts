
import type { Analysis } from "./analysis";

export interface Entry {
  id: string;
  createdAt: string;
  text: string;
  analysis: Analysis;
}

const ENTRIES_KEY = "echo:entries:v1";
const SESSION_KEY = "echo:session:v1";
const MAX_ENTRIES = 400;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  return safeParse<Entry[]>(localStorage.getItem(ENTRIES_KEY), []);
}

export function saveEntry(text: string, analysis: Analysis): Entry {
  const entry: Entry = {
    id: uid(),
    createdAt: new Date().toISOString(),
    text,
    analysis,
  };
  const all = loadEntries();
  all.unshift(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  return entry;
}

export function getEntry(id: string): Entry | undefined {
  return loadEntries().find((e) => e.id === id);
}

export function deleteEntry(id: string): void {
  if (typeof window === "undefined") return;
  const all = loadEntries().filter((e) => e.id !== id);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(all));
}
