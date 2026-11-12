export const DIFFICULTIES = {
  easy: { label: "Easy", hp: 8, base: 80, description: "Lebih banyak kesempatan." },
  normal: { label: "Normal", hp: 5, base: 100, description: "Tantangan yang seimbang." },
  hard: { label: "Hard", hp: 3, base: 120, description: "Setiap tebakan berarti." },
};

export function normalizeAnswer(value) {
  return String(value)
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function matchesAnswer(hero, answer) {
  const normalized = normalizeAnswer(answer);
  return (
    normalized.length > 0 &&
    [hero.name, ...hero.aliases].some((name) => normalizeAnswer(name) === normalized)
  );
}

export function clueContainsAnswer(hero, text) {
  // Whole words/phrases, not arbitrary substrings: "memakai" does not reveal Akai.
  const words = text.normalize("NFKC").match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  const names = new Set([hero.name, ...hero.aliases].map(normalizeAnswer));
  for (let start = 0; start < words.length; start++) {
    for (let length = 1; length <= 5 && start + length <= words.length; length++) {
      if (names.has(normalizeAnswer(words.slice(start, start + length).join(" ")))) return true;
    }
  }
  return false;
}

export function validateHeroes(heroes, { release = false } = {}) {
  const errors = [];
  const ids = new Set();
  const aliases = new Map();
  for (const hero of heroes) {
    if (!hero.id || ids.has(hero.id)) errors.push(`Duplicate or missing ID: ${hero.id}`);
    ids.add(hero.id);
    for (const name of [hero.name, ...hero.aliases]) {
      const key = normalizeAnswer(name);
      if (!key || (aliases.has(key) && aliases.get(key) !== hero.id))
        errors.push(`Conflicting alias: ${name}`);
      aliases.set(key, hero.id);
    }
    if (hero.clues.length !== 5) errors.push(`${hero.id}: requires 5 clues`);
    const unique = new Set();
    for (const clue of hero.clues) {
      const key = normalizeAnswer(clue.text);
      if (!key || clue.text.includes("...") || unique.has(key))
        errors.push(`${hero.id}: empty/duplicate/placeholder clue`);
      if (clueContainsAnswer(hero, clue.text)) errors.push(`${hero.id}: answer leaked in clue`);
      if (!/^https:\/\//.test(clue.sourceUrl || "") || !clue.reviewStatus)
        errors.push(`${hero.id}: clue source/review metadata missing`);
      if (
        release &&
        (clue.reviewStatus !== "verified" || !clue.verifiedAt || !clue.reviewer || !clue.evidence)
      )
        errors.push(`${hero.id}: clue ${clue.order} evidence/review required`);
      unique.add(key);
    }
    if (!/^https:\/\//.test(hero.sourceUrl)) errors.push(`${hero.id}: missing source reference`);
    if (
      release &&
      (!hero.roleFact ||
        hero.roleFact.reviewStatus !== "verified" ||
        !hero.roleFact.evidence ||
        !hero.roleFact.verifiedAt ||
        !hero.roleFact.reviewer)
    )
      errors.push(`${hero.id}: role fact evidence/review required`);
    if (release && (hero.reviewStatus !== "verified" || !hero.verifiedAt))
      errors.push(`${hero.id}: external content review required`);
  }
  return errors;
}

export function validateRoster(roster) {
  const ids = new Set();
  const names = new Set();
  const errors = [];
  for (const hero of roster) {
    if (!hero.id || ids.has(hero.id)) errors.push(`Duplicate/missing roster ID: ${hero.id}`);
    const name = normalizeAnswer(hero.name);
    if (!name || names.has(name)) errors.push(`Duplicate/missing roster name: ${hero.name}`);
    ids.add(hero.id);
    names.add(name);
    if (
      !hero.enabled &&
      (!hero.reason || hero.reviewStatus !== "blocked" || hero.clues.length !== 0)
    )
      errors.push(
        `${hero.id}: pending roster entry requires an explicit blocker and no playable clues`,
      );
  }
  return [...errors, ...validateHeroes(roster.filter((hero) => hero.enabled))];
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createSession(
  heroes,
  difficulty = "normal",
  { random = Math.random, id = crypto.randomUUID(), now = Date.now() } = {},
) {
  const selected = DIFFICULTIES[difficulty] ? difficulty : "normal";
  if (!heroes.length) throw new Error("No playable heroes");
  return {
    id,
    difficulty: selected,
    heroIds: shuffle(heroes, random)
      .slice(0, 5)
      .map((hero) => hero.id),
    round: 0,
    clueIndex: 0,
    wrongOnHero: 0,
    hp: DIFFICULTIES[selected].hp,
    phase: "guessing",
    revision: 0,
    rounds: [],
    startedAt: now,
    completedAt: null,
    feedback: null,
  };
}

export function potentialPoints(state) {
  return Math.max(
    10,
    DIFFICULTIES[state.difficulty].base - 15 * state.clueIndex - 10 * state.wrongOnHero,
  );
}

function finishRound(state, outcome, now) {
  const record = {
    heroId: state.heroIds[state.round],
    outcome,
    points: outcome === "correct" ? potentialPoints(state) : 0,
    extraClues: state.clueIndex,
    wrong: state.wrongOnHero,
  };
  return {
    ...state,
    rounds: [...state.rounds, record],
    phase: state.hp === 0 ? "completed" : "reveal",
    completedAt: state.hp === 0 ? now : null,
    feedback: outcome,
  };
}

// A revision is attached at the UI boundary: repeated/stale actions cannot score twice.
export function transition(state, action, heroes) {
  if (action.revision !== state.revision || state.phase === "completed") return state;
  const now = action.now ?? Date.now();
  let next = state;
  if (action.type === "guess" && state.phase === "guessing") {
    if (!normalizeAnswer(action.answer)) return state;
    const hero = heroes.find((item) => item.id === state.heroIds[state.round]);
    if (matchesAnswer(hero, action.answer)) next = finishRound(state, "correct", now);
    else {
      next = {
        ...state,
        hp: state.hp - 1,
        wrongOnHero: state.wrongOnHero + 1,
        feedback: "wrong",
        phase: "wrong",
      };
      if (!next.hp) next = finishRound(next, "unanswered", now);
    }
  } else if (action.type === "retry" && state.phase === "wrong") {
    next = { ...state, phase: "guessing" };
  } else if (action.type === "hint" && state.phase === "guessing" && state.clueIndex < 4) {
    next = { ...state, clueIndex: state.clueIndex + 1, feedback: null };
  } else if (action.type === "skip" && state.phase === "guessing") {
    next = finishRound(state, "skipped", now);
  } else if (action.type === "next" && state.phase === "reveal") {
    next =
      state.round === state.heroIds.length - 1
        ? { ...state, phase: "completed", completedAt: now }
        : {
            ...state,
            round: state.round + 1,
            clueIndex: 0,
            wrongOnHero: 0,
            phase: "guessing",
            feedback: null,
          };
  }
  return next === state ? state : { ...next, revision: state.revision + 1 };
}

export function summarize(state) {
  const correct = state.rounds.filter((round) => round.outcome === "correct").length;
  const wrong = state.rounds.reduce((sum, round) => sum + round.wrong, 0);
  return {
    score: state.rounds.reduce((sum, round) => sum + round.points, 0),
    correct,
    wrong,
    total: state.heroIds.length,
    hints: state.rounds.reduce((sum, round) => sum + round.extraClues, 0),
    skipped: state.rounds.filter((round) => round.outcome === "skipped").length,
    accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0,
  };
}
