import test from "node:test";
import assert from "node:assert/strict";
import {
  HEROES,
  CONTENT_VERSION,
  ROSTER,
  PENDING_HEROES,
} from "../src/features/hero-hunt/content.js";
import { ML_HEROES } from "../src/data/ml-heroes.js";
import {
  createSession,
  DIFFICULTIES,
  matchesAnswer,
  normalizeAnswer,
  potentialPoints,
  shuffle,
  summarize,
  transition,
  validateHeroes,
  validateRoster,
  clueContainsAnswer,
} from "../src/features/hero-hunt/engine.js";
import { isSession, useHuntStore } from "../src/features/hero-hunt/store.js";
import audioHandler from "../api/proxy-audio.js";
const fresh = (difficulty = "normal", heroes = HEROES) =>
  createSession(heroes, difficulty, { id: "test", random: () => 0.5, now: 1000 });
const act = (state, type, extra = {}) =>
  transition(state, { type, revision: state.revision, now: 2000, ...extra }, HEROES);
const answer = (state) => HEROES.find((hero) => hero.id === state.heroIds[state.round]).name;

test("preview data passes structure; release data fails pending source review", () => {
  assert.equal(HEROES.length, 126);
  assert.deepEqual(validateHeroes(HEROES), []);
  const releaseErrors = validateHeroes(HEROES, { release: true });
  assert.ok(
    HEROES.every((hero) => releaseErrors.includes(`${hero.id}: external content review required`)),
  );
  const altered = structuredClone(HEROES);
  altered[1].aliases.push(altered[0].name);
  altered[0].clues[0].text = altered[0].name;
  assert.ok(validateHeroes(altered).some((e) => e.includes("alias")));
  assert.ok(validateHeroes(altered).some((e) => e.includes("leaked")));
});
test("all 133 legacy names are accounted for; incomplete entries cannot enter a session", () => {
  assert.deepEqual(validateRoster(ROSTER), []);
  assert.equal(ROSTER.length, 133);
  assert.equal(PENDING_HEROES.length, 7);
  assert.deepEqual(
    ROSTER.map((hero) => hero.name).sort(),
    ML_HEROES.map((hero) => hero.name).sort(),
  );
  assert.equal(
    HEROES.reduce((sum, hero) => sum + hero.clues.length, 0),
    630,
  );
  assert.ok(
    PENDING_HEROES.every(
      (hero) => !hero.enabled && hero.reason && !HEROES.some((item) => item.id === hero.id),
    ),
  );
});
test("answer leak detection distinguishes whole names from common-word substrings", () => {
  const akai = HEROES.find((hero) => hero.name === "Akai");
  assert.equal(clueContainsAnswer(akai, "Ia memakai tongkat."), false);
  assert.equal(clueContainsAnswer(akai, "Hero ini bernama Akai."), true);
  const xborg = HEROES.find((hero) => hero.name === "X.Borg");
  assert.equal(clueContainsAnswer(xborg, "Ini X Borg."), true);
  assert.equal(clueContainsAnswer(xborg, "Ini X.Borg!"), true);
});
test("a hero-level flag alone cannot bypass per-clue release evidence", () => {
  const hero = structuredClone(HEROES[0]);
  hero.reviewStatus = "verified";
  hero.verifiedAt = "2026-11-12";
  assert.equal(
    validateHeroes([hero], { release: true }).filter(
      (error) => error.includes(": clue ") && error.includes("evidence/review"),
    ).length,
    5,
  );
});
test("every playable hero has five distinct structurally valid clues and can complete a session", () => {
  for (const hero of HEROES) {
    let state = createSession([hero], "normal", { id: hero.id, random: () => 0, now: 1000 });
    for (let index = 0; index < 4; index++) state = act(state, "hint");
    state = act(state, "guess", { answer: hero.name });
    state = act(state, "next");
    assert.equal(state.phase, "completed", hero.name);
    assert.equal(summarize(state).score, 40, hero.name);
    assert.ok(isSession({ ...state, contentVersion: CONTENT_VERSION }), hero.name);
  }
});
test("normalizes Unicode, accents and punctuation; requires explicit aliases and rejects typos", () => {
  for (const [name, input] of [
    ["X.Borg", " Ｘ.ＢＯＲＧ "],
    ["Yi Sun-shin", "yi sun shin"],
    ["Chang'e", "changé"],
    ["Popol and Kupa", "popol & kupa"],
  ]) {
    const hero = HEROES.find((h) => h.name === name);
    assert.ok(matchesAnswer(hero, input), input);
    assert.equal(matchesAnswer(hero, "Franco"), false);
  }
  assert.equal(normalizeAnswer("...  "), "");
  assert.equal(matchesAnswer(HEROES[0], "frnaco"), false);
  assert.equal(matchesAnswer({ name: "Popol and Kupa", aliases: [] }, "Popol & Kupa"), false);
});
test("Fisher–Yates is deterministic, nonmutating and never repeats a hero", () => {
  const source = [1, 2, 3, 4, 5];
  assert.deepEqual(
    shuffle(source, () => 0),
    [2, 3, 4, 5, 1],
  );
  assert.deepEqual(source, [1, 2, 3, 4, 5]);
  assert.equal(new Set(fresh().heroIds).size, 5);
  assert.equal(fresh("normal", HEROES.slice(0, 3)).heroIds.length, 3);
  assert.throws(() => fresh("normal", []), /No playable/);
});
test("difficulty controls HP and base points with a Normal fallback", () => {
  for (const [key, config] of Object.entries(DIFFICULTIES)) {
    const s = fresh(key);
    assert.equal(s.hp, config.hp);
    assert.equal(potentialPoints(s), config.base);
    assert.equal(act(s, "guess", { answer: "unknown" }).hp, config.hp - 1);
  }
  assert.equal(fresh("nightmare").difficulty, "normal");
});
test("empty, stale, repeated and in-feedback submissions do not consume additional HP", () => {
  const s = fresh();
  assert.equal(act(s, "guess", { answer: "... " }), s);
  const wrong = act(s, "guess", { answer: "unknown" });
  assert.equal(wrong.hp, 4);
  assert.equal(wrong.phase, "wrong");
  assert.equal(
    transition(wrong, { type: "guess", revision: s.revision, answer: "unknown" }, HEROES),
    wrong,
  );
  assert.equal(act(wrong, "guess", { answer: "unknown" }), wrong);
  assert.equal(act(wrong, "retry").phase, "guessing");
});
test("Normal clue 3 plus one miss awards 60; correct reveal cannot award twice", () => {
  let s = act(act(fresh(), "hint"), "hint");
  assert.equal(s.hp, 5);
  s = act(act(s, "guess", { answer: "unknown" }), "retry");
  assert.equal(potentialPoints(s), 60);
  const won = act(s, "guess", { answer: answer(s) });
  assert.equal(won.phase, "reveal");
  assert.equal(won.hp, 4);
  assert.equal(summarize(won).score, 60);
  assert.equal(summarize(won).accuracy, 50);
  assert.equal(act(won, "guess", { answer: answer(s) }), won);
  const next = act(won, "next");
  assert.equal(next.clueIndex, 0);
  assert.equal(next.wrongOnHero, 0);
  assert.equal(next.hp, 4);
});
test("hint boundary and ten-point floor hold", () => {
  let s = fresh("easy");
  for (let i = 0; i < 4; i++) s = act(s, "hint");
  assert.equal(act(s, "hint"), s);
  for (let i = 0; i < 3; i++) s = act(act(s, "guess", { answer: "unknown" }), "retry");
  assert.equal(potentialPoints(s), 10);
  assert.equal(act(s, "guess", { answer: answer(s) }).rounds[0].points, 10);
});
test("five correct answers total exactly 500; duplicate next actions cannot skip rounds", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) {
    s = act(s, "guess", { answer: answer(s) });
    assert.equal(s.phase, "reveal");
    const revision = s.revision;
    s = act(s, "next");
    assert.equal(transition(s, { type: "next", revision }, HEROES), s);
  }
  assert.equal(s.phase, "completed");
  assert.deepEqual(summarize(s), {
    score: 500,
    correct: 5,
    wrong: 0,
    total: 5,
    hints: 0,
    skipped: 0,
    accuracy: 100,
  });
  assert.equal(act(s, "next"), s);
});
test("HP exhaustion preserves earlier points and records the failed final hero", () => {
  let s = fresh("hard");
  s = act(act(s, "guess", { answer: answer(s) }), "next");
  for (let i = 0; i < 3; i++) {
    s = act(s, "guess", { answer: "unknown" });
    if (s.phase === "wrong") s = act(s, "retry");
  }
  assert.equal(s.phase, "completed");
  assert.equal(s.hp, 0);
  assert.equal(s.rounds.length, 2);
  assert.equal(s.rounds[1].outcome, "unanswered");
  assert.equal(summarize(s).score, 120);
  assert.equal(summarize(s).accuracy, 25);
});
test("skip gives zero points and preserves HP, including an entirely skipped session", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = act(act(s, "skip"), "next");
  assert.equal(s.hp, 5);
  assert.equal(summarize(s).skipped, 5);
  assert.equal(summarize(s).accuracy, 0);
  assert.equal(summarize(s).score, 0);
});
test("storage schema rejects incompatible and malformed sessions", () => {
  const s = { ...fresh(), contentVersion: CONTENT_VERSION };
  assert.ok(isSession(s));
  assert.ok(isSession({ ...s, contentVersion: "editorial-preview-1" }));
  assert.equal(isSession({ ...s, contentVersion: "old" }), false);
  assert.equal(isSession({ ...s, hp: -1 }), false);
  assert.equal(isSession({ ...s, heroIds: ["unknown"] }), false);
  assert.equal(isSession({ ...s, phase: "completed", completedAt: 2000 }), false);
  assert.equal(isSession({ ...s, rounds: [null] }), false);
});
test("store saves results once, preserves old keys, and remains playable if storage fails", () => {
  const map = new Map([["legacy-player", "untouched"]]);
  const storage = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
  };
  globalThis.window = { localStorage: storage, sessionStorage: storage };
  useHuntStore.setState({ history: [], settings: { difficulty: "normal", muted: true, name: "" } });
  useHuntStore.getState().start();
  for (let i = 0; i < 5; i++) {
    let current = useHuntStore.getState().session;
    useHuntStore
      .getState()
      .act({ type: "guess", revision: current.revision, answer: answer(current) });
    current = useHuntStore.getState().session;
    useHuntStore.getState().act({ type: "next", revision: current.revision });
    useHuntStore.getState().act({ type: "next", revision: current.revision });
  }
  assert.equal(useHuntStore.getState().history.length, 1);
  assert.equal(JSON.parse(map.get("hero-hunt.history.v1")).length, 1);
  assert.equal(map.get("legacy-player"), "untouched");
  assert.ok(isSession(JSON.parse(map.get("hero-hunt.session.v1"))));
  window.localStorage = {
    setItem() {
      throw new Error("Storage denied");
    },
  };
  useHuntStore.getState().updateSettings({ name: "Hunter" });
  assert.equal(useHuntStore.getState().settings.name, "Hunter");
  assert.equal(useHuntStore.getState().storageWarning, true);
  delete globalThis.window;
});
test("retired audio endpoint rejects arbitrary URLs", () => {
  const response = {
    code: null,
    payload: null,
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(value) {
      this.payload = value;
      return this;
    },
  };
  audioHandler({ query: { url: "http://127.0.0.1/admin" } }, response);
  assert.equal(response.code, 410);
  assert.ok(response.payload.error);
});

test("mixed clues show complete roles at clue 2, preserving the five-clue score structure", async () => {
  const { getSessionClues, clueCategory } =
    await import("../src/features/hero-hunt/clue-profiles.js");
  for (const hero of HEROES) {
    const mixed = getSessionClues(hero, "mixed");
    assert.equal(mixed.length, 5);
    assert.equal(mixed[1].type, "Role");
    assert.equal(mixed[1].text, `Role hero ini: ${hero.roles.join(" / ")}.`);
    assert.equal(mixed[1].sourceUrl, hero.roleFact.sourceUrl);
    assert.equal(mixed[1].reviewStatus, "needs_review");
    assert.equal(mixed[2], hero.clues[2]);
    assert.equal(mixed[4], hero.clues[4]);
    assert.equal(clueCategory(mixed[4]), "Signature");
    assert.equal(clueContainsAnswer(hero, mixed[1].text), false);
    assert.equal(getSessionClues(hero), hero.clues); // Existing sessions remain unchanged.
    assert.equal(getSessionClues(hero, "story"), hero.clues);
    assert.equal(hero.identity.gender, null); // Not inferred from character artwork.
  }
});

test("clue preference is captured at session start, and malformed persisted profiles are rejected", async () => {
  const { getSessionClues } = await import("../src/features/hero-hunt/clue-profiles.js");
  useHuntStore.setState({
    settings: { difficulty: "normal", clueProfile: "mixed", muted: true, name: "" },
  });
  const session = useHuntStore.getState().start();
  assert.equal(session.clueProfile, "mixed");
  useHuntStore.getState().updateSettings({ clueProfile: "story" });
  assert.equal(useHuntStore.getState().session.clueProfile, "mixed");
  assert.equal(getSessionClues(HEROES[0], session.clueProfile)[1].type, "Role");
  assert.equal(useHuntStore.getState().start().clueProfile, "story");
  assert.equal(isSession({ ...session, clueProfile: "invented" }), false);
});

test("audio gate rejects missing rights, source, language, spoilers, playback, and remote URLs", async () => {
  const { audioEligibility, playableAudioHeroes } =
    await import("../src/features/hero-hunt/audio-catalog.js");
  const audio = {
    kind: "hero_selection_default",
    skin: "default",
    language: "en",
    sourceUrl: "https://example.org/audio",
    sourceStatus: "verified",
    sourceEvidence: "Selection event confirmed",
    licenseStatus: "licensed",
    licenseEvidence: "Test fixture only",
    playbackStatus: "tested",
    playbackTestedAt: "2026-11-12",
    reviewer: "Test fixture",
    spoilerStatus: "clear",
    spoilerEvidence: "No name spoken",
    localAssetPath: "/audio/hero-hunt/voice-001.ogg",
  };
  assert.equal(audioEligibility(audio).ready, true);
  for (const patch of [
    { kind: "movement" },
    { skin: "collaboration" },
    { language: "id" },
    { sourceStatus: "needs_review" },
    { sourceEvidence: null },
    { licenseStatus: "not_verified" },
    { licenseEvidence: null },
    { playbackStatus: "not_tested" },
    { reviewer: null },
    { spoilerStatus: "reveals_name" },
    { spoilerEvidence: null },
    { localAssetPath: "https://example.org/voice.ogg" },
    { localAssetPath: "/audio/hero-hunt/../secret.ogg" },
    { localAssetPath: "/api/proxy-audio?url=anything" },
  ])
    assert.equal(audioEligibility({ ...audio, ...patch }).ready, false, JSON.stringify(patch));
  assert.equal(audioEligibility(null).ready, false);
  assert.deepEqual(playableAudioHeroes(HEROES), []);
});
