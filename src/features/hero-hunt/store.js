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
  ? rawHistory.filter((item) => isSession(item) && item.phase === "completed")
  : [];

export const useHuntStore = create((set, get) => ({
  session: isSession(rawSession)
    ? { ...rawSession, phase: rawSession.phase === "wrong" ? "guessing" : rawSession.phase }
    : null,
  history,
  settings: {
    difficulty: DIFFICULTIES[rawSettings?.difficulty] ? rawSettings.difficulty : "normal",
    music: rawSettings?.music !== false,
    effects: rawSettings?.effects !== false,
    muted: typeof rawSettings?.muted === "boolean" ? rawSettings.muted : false,
    clueProfile: CLUE_PROFILES[rawSettings?.clueProfile] ? rawSettings.clueProfile : "mixed",
    name: typeof rawSettings?.name === "string" ? rawSettings.name.slice(0, 24) : "",
  },
  storageWarning: false,
  start() {
    const difficulty = get().settings.difficulty;
    const records = get().history.flatMap(session => session.rounds);
    const experience = new Map();
    for (const round of records) {
      const current = experience.get(round.heroId) || { count: 0, effort: 0 };
      current.count++;
      current.effort += round.extraClues + round.wrong + (round.outcome === "correct" ? 0 : 5);
      experience.set(round.heroId, current);
    }
    let pool = HEROES;
    if (experience.size >= 10 && difficulty !== "normal") {
      const ranked = [...HEROES].sort((a, b) => {
        const x = experience.get(a.id), y = experience.get(b.id);
        const score = item => item ? item.effort / item.count : 3;
        return (score(x) - score(y)) * (difficulty === "easy" ? 1 : -1);
      });
      pool = ranked.slice(0, Math.max(20, Math.ceil(ranked.length / 2)));
    }
    const session = {
      ...createSession(pool, difficulty),
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
      history = [next, ...history];
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

let soundContext;
const ambientNotes = new Set();
export function stopAmbience() {
  for (const note of ambientNotes) note.stop();
  ambientNotes.clear();
}
export function gameSound(kind) {
  if (useHuntStore.getState().settings.muted || document.hidden) return;
  if (kind === "lobby" ? !useHuntStore.getState().settings.music : !useHuntStore.getState().settings.effects) return;
  const notes = {
    tap: [1568, 2352], correct: [523, 784, 1046, 1568], wrong: [147, 110],
    lobby: [196, 294, 392, 349],
  };
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    soundContext ??= new Audio();
    const ctx = soundContext;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const ambient = kind === "lobby";
    if (!ambient) {
      const length = kind === "tap" ? .16 : .28;
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const blade = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const envelope = ctx.createGain();
      blade.buffer = buffer;
      filter.type = "bandpass";
      filter.Q.value = .8;
      filter.frequency.setValueAtTime(4500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + length);
      envelope.gain.setValueAtTime(.0001, ctx.currentTime);
      envelope.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + .025);
      envelope.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + length);
      blade.connect(filter).connect(envelope).connect(ctx.destination);
      blade.start(); blade.stop(ctx.currentTime + length);
    }
    const duration = ambient ? 1.4 : kind === "tap" ? 0.06 : 0.18;
    notes[kind].forEach((frequency, i) => {
      const start = ctx.currentTime + i * (ambient ? 1.05 : duration * 0.65);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = ambient ? "sine" : "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(ambient ? 0.024 : 0.075, start + (ambient ? 0.25 : 0.008));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start); osc.stop(start + duration);
      if (ambient) {
        ambientNotes.add(osc);
        osc.onended = () => ambientNotes.delete(osc);
      }
    });
  } catch { /* Playback is optional on devices without Web Audio. */ }
}
export function silenceGameSound() {
  stopAmbience();
  if (soundContext) {
    soundContext.close().catch(() => {});
    soundContext = undefined;
  }
}
export function playTone(correct) { gameSound(correct ? "correct" : "wrong"); }
