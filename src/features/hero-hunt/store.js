import { create } from "zustand";
import { HEROES, CONTENT_VERSION, COMPATIBLE_CONTENT_VERSIONS } from "./content.js";
import { createSession, DIFFICULTIES, transition } from "./engine.js";

import { CLUE_PROFILES } from "./clue-profiles.js";

const HISTORY_KEY = "hero-hunt.history.v1";
const SESSION_KEY = "hero-hunt.session.v1";
const SETTINGS_KEY = "hero-hunt.settings.v1";
const PHASES = ["guessing", "wrong", "reveal", "completed"];

function read(kind, key, fallback) {
  try {
    return JSON.parse(window[kind].getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(kind, key, value) {
  try {
    window[kind].setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isSession(value) {
  if (
    !value ||
    !COMPATIBLE_CONTENT_VERSIONS.includes(value.contentVersion) ||
    !DIFFICULTIES[value.difficulty]
  )
    return false;
  if (value.clueProfile !== undefined && !CLUE_PROFILES[value.clueProfile]) return false;
  if (typeof value.id !== "string" || !PHASES.includes(value.phase)) return false;
  if (!Array.isArray(value.heroIds) || !value.heroIds.length || value.heroIds.length > 5)
    return false;
  if (
    new Set(value.heroIds).size !== value.heroIds.length ||
    !value.heroIds.every((id) => HEROES.some((hero) => hero.id === id))
  )
    return false;
  if (!Number.isInteger(value.round) || value.round < 0 || value.round >= value.heroIds.length)
    return false;
  if (!Number.isInteger(value.clueIndex) || value.clueIndex < 0 || value.clueIndex > 4)
    return false;
  if (!Number.isInteger(value.hp) || value.hp < 0 || value.hp > DIFFICULTIES[value.difficulty].hp)
    return false;
  if (
    !Number.isInteger(value.revision) ||
    value.revision < 0 ||
    !Number.isInteger(value.wrongOnHero) ||
    value.wrongOnHero < 0
  )
    return false;
  if (
    !Number.isFinite(value.startedAt) ||
    (value.phase === "completed" && !Number.isFinite(value.completedAt))
  )
    return false;
  if (!Array.isArray(value.rounds) || value.rounds.length > value.heroIds.length) return false;
  const expectedRounds = value.round + (["reveal", "completed"].includes(value.phase) ? 1 : 0);
  if (value.rounds.length !== expectedRounds) return false;
  if (value.phase === "completed" && value.hp > 0 && value.round !== value.heroIds.length - 1)
    return false;
  if (value.phase !== "completed" && value.hp === 0) return false;
  return value.rounds.every(
    (round, index) =>
      round &&
      round.heroId === value.heroIds[index] &&
      ["correct", "skipped", "unanswered"].includes(round.outcome) &&
      Number.isInteger(round.points) &&
      round.points >= 0 &&
      round.points <= DIFFICULTIES[value.difficulty].base &&
      Number.isInteger(round.wrong) &&
      round.wrong >= 0 &&
      Number.isInteger(round.extraClues) &&
      round.extraClues >= 0 &&
      round.extraClues <= 4,
  );
}

const rawSession = read("sessionStorage", SESSION_KEY, null);
const rawHistory = read("localStorage", HISTORY_KEY, []);
const rawSettings = read("localStorage", SETTINGS_KEY, {});
const history = Array.isArray(rawHistory)
  ? rawHistory.filter((item) => isSession(item) && item.phase === "completed").slice(0, 50)
  : [];

export const useHuntStore = create((set, get) => ({
  session: isSession(rawSession)
    ? { ...rawSession, phase: rawSession.phase === "wrong" ? "guessing" : rawSession.phase }
    : null,
  history,
  settings: {
    difficulty: DIFFICULTIES[rawSettings?.difficulty] ? rawSettings.difficulty : "normal",
    muted: typeof rawSettings?.muted === "boolean" ? rawSettings.muted : false,
    clueProfile: CLUE_PROFILES[rawSettings?.clueProfile] ? rawSettings.clueProfile : "mixed",
    name: typeof rawSettings?.name === "string" ? rawSettings.name.slice(0, 24) : "",
  },
  storageWarning: false,
  start() {
    const session = {
      ...createSession(HEROES, get().settings.difficulty),
      contentVersion: CONTENT_VERSION,
      clueProfile: get().settings.clueProfile || "mixed",
    };
    const saved = write("sessionStorage", SESSION_KEY, session);
    set({ session, storageWarning: !saved });
    return session;
  },
  act(action) {
    const current = get().session;
    if (!current) return;
    const next = transition(current, action, HEROES);
    if (next === current) return;
    let saved = write("sessionStorage", SESSION_KEY, next);
    let history = get().history;
    if (next.phase === "completed" && !history.some((item) => item.id === next.id)) {
      history = [next, ...history].slice(0, 50);
      saved = write("localStorage", HISTORY_KEY, history) && saved;
    }
    set({ session: next, history, storageWarning: !saved });
  },
  abandon() {
    const saved = write("sessionStorage", SESSION_KEY, null);
    set({ session: null, storageWarning: !saved });
  },
  updateSettings(patch) {
    const settings = { ...get().settings, ...patch };
    const saved = write("localStorage", SETTINGS_KEY, settings);
    set({ settings, storageWarning: !saved });
  },
}));

// Procedural feedback only. No third-party voice lines or external audio requests.
export function playTone(correct) {
  if (useHuntStore.getState().settings.muted) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const context = new Audio();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain).connect(context.destination);
    oscillator.frequency.setValueAtTime(correct ? 660 : 180, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      correct ? 990 : 110,
      context.currentTime + 0.12,
    );
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch {
    /* Unsupported audio must not block a guess. */
  }
}
