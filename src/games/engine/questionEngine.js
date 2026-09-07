// games/engine/questionEngine.js — the single place that turns a
// content filter into an actual sequence of normalized Question
// objects, per the Frontend Architecture Blueprint §5 (Game Framework).
//
// Reads from the unified content layer (src/content/*.js, Steps 22–25)
// — not from the legacy src/data/*.js files, which existing game views
// still use directly and which this engine deliberately does not touch.
//
// No game consumes this yet (that's Milestone 4, once real games are
// rebuilt on the Game Framework) — this is the engine itself, built and
// independently verifiable first.

import { LEXICAL_ITEMS } from '@/content/lexicalItems'
import { EXAMPLE_SENTENCES } from '@/content/exampleSentences'
import { QUIZ_QUESTIONS } from '@/content/quizQuestions'
import { CEFR_LEVELS } from '@/content/schema'

/**
 * @typedef {Object} Question
 * A normalized shape every game reads, regardless of which content
 * source it was built from.
 * @property {string} id
 * @property {'lexicalItem'|'exampleSentence'|'quizQuestion'} sourceType
 * @property {string} sourceId
 * @property {string} prompt - What's shown (and, for listening questions, also spoken).
 * @property {string} correctAnswer
 * @property {string[]|null} options - Multiple-choice options, or null for a typed-answer question.
 * @property {string} cefr
 * @property {string[]} masteryTracks - Which progress.js MASTERY_TRACKS this question exercises.
 * @property {string|null} audioText - Text to pass to TTS, if this is a listening-style question.
 */

function matchesFilter(item, filter = {}) {
  if (filter.cefr && filter.cefr.length > 0 && !filter.cefr.includes(item.cefr)) return false
  if (filter.tags && filter.tags.length > 0) {
    const itemTags = item.tags || []
    if (!filter.tags.some((tag) => itemTags.includes(tag))) return false
  }
  if (filter.type && item.type && item.type !== filter.type) return false
  return true
}

/**
 * Weighted random sample without replacement. Items belonging to a
 * mastery track the player is weaker in get up to 2x selection weight —
 * a real, working implementation of the GDD's "Difficulty Scaling"
 * system, even though no game currently supplies non-trivial
 * masteryScores yet (progress.js is still a skeleton as of Step 18/25;
 * this correctly degrades to uniform-random sampling when
 * masteryScores is omitted or empty).
 */
function weightedSample(pool, count, { masteryScores = {}, trackForItem = () => null } = {}) {
  const weighted = pool.map((item) => {
    const track = trackForItem(item)
    const score = track && typeof masteryScores[track] === 'number' ? masteryScores[track] : 50
    const weight = 1 + (100 - score) / 100 // 1x (mastered) .. 2x (unpracticed)
    return { item, weight }
  })

  const picked = []
  const remaining = [...weighted]
  const n = Math.min(count, remaining.length)

  for (let i = 0; i < n; i++) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0)
    let roll = Math.random() * totalWeight
    let index = 0
    for (; index < remaining.length; index++) {
      roll -= remaining[index].weight
      if (roll <= 0) break
    }
    picked.push(remaining[index].item)
    remaining.splice(index, 1)
  }

  return picked
}

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Generates plausible wrong-answer options for a LexicalItem by
 * sampling other items at the same (or an adjacent) CEFR level with a
 * different translation — per the Frontend Architecture Blueprint's
 * description of dynamically-generated vocabulary distractors.
 */
function generateDistractors(correctItem, pool, count) {
  const sameLevel = pool.filter(
    (item) => item.id !== correctItem.id && item.translation !== correctItem.translation
  )
  const levelIndex = CEFR_LEVELS.indexOf(correctItem.cefr)
  const prioritized = sameLevel.sort((a, b) => {
    const aDist = Math.abs(CEFR_LEVELS.indexOf(a.cefr) - levelIndex)
    const bDist = Math.abs(CEFR_LEVELS.indexOf(b.cefr) - levelIndex)
    return aDist - bDist
  })
  const chosen = shuffle(prioritized.slice(0, Math.max(count * 3, count))).slice(0, count)
  return chosen.map((item) => item.translation)
}

/**
 * Vocabulary multiple-choice questions built from LEXICAL_ITEMS.
 * prompt = the English word; correctAnswer/options = translations.
 */
function buildVocabularyQuestions(filter, count, masteryScores) {
  const pool = LEXICAL_ITEMS.filter((item) => matchesFilter(item, filter))
  const picked = weightedSample(pool, count, {
    masteryScores,
    trackForItem: () => 'vocabulary',
  })

  return picked.map((item) => {
    const distractors = generateDistractors(item, pool, 3)
    const options = shuffle([item.translation, ...distractors])
    return {
      id: `q-vocab-${item.id}`,
      sourceType: 'lexicalItem',
      sourceId: item.id,
      prompt: item.text,
      correctAnswer: item.translation,
      options,
      cefr: item.cefr,
      masteryTracks: ['vocabulary'],
      audioText: null,
    }
  })
}

/**
 * Listening/dictation questions built from EXAMPLE_SENTENCES. Typed-
 * answer by design (options: null) — matches Listen & Write's existing
 * dictation mechanic.
 */
function buildListeningQuestions(filter, count, masteryScores) {
  const pool = EXAMPLE_SENTENCES.filter((item) => matchesFilter(item, filter))
  const picked = weightedSample(pool, count, {
    masteryScores,
    trackForItem: () => 'listening',
  })

  return picked.map((item) => ({
    id: `q-listen-${item.id}`,
    sourceType: 'exampleSentence',
    sourceId: item.id,
    prompt: item.translation,
    correctAnswer: item.text,
    options: null,
    cefr: item.cefr,
    masteryTracks: ['listening'],
    audioText: item.text,
  }))
}

const QUIZ_TAG_TO_TRACK = {
  vocab: 'vocabulary',
  synonym: 'vocabulary',
  grammar: 'grammar',
}

/**
 * Curated multiple-choice questions read directly from QUIZ_QUESTIONS —
 * these are already fully authored, so no distractor generation is
 * needed, per the Blueprint's reasoning for keeping this a distinct,
 * curated content type (see Step 24's changelog).
 */
function buildQuizQuestions(filter, count, masteryScores) {
  const pool = QUIZ_QUESTIONS.filter((item) => matchesFilter(item, filter))
  const picked = weightedSample(pool, count, {
    masteryScores,
    trackForItem: (item) => QUIZ_TAG_TO_TRACK[item.tag] || 'vocabulary',
  })

  return picked.map((item) => ({
    id: `q-quiz-${item.id}`,
    sourceType: 'quizQuestion',
    sourceId: item.id,
    prompt: item.prompt,
    correctAnswer: item.options[item.correctIndex],
    options: item.options,
    cefr: item.cefr,
    masteryTracks: [QUIZ_TAG_TO_TRACK[item.tag] || 'vocabulary'],
    audioText: null,
  }))
}

const BUILDERS = {
  vocabulary: buildVocabularyQuestions,
  listening: buildListeningQuestions,
  quiz: buildQuizQuestions,
}

/**
 * The Question Engine's single public entry point.
 *
 * @param {Object} params
 * @param {'vocabulary'|'listening'|'quiz'} params.source
 * @param {import('@/content/schema').ContentFilter} [params.filter]
 * @param {number} params.count
 * @param {Record<string, number>} [params.masteryScores] - track name -> 0-100 score, per progress.js's MASTERY_TRACKS.
 * @returns {Question[]}
 */
export function getQuestions({ source, filter = {}, count, masteryScores = {} }) {
  const builder = BUILDERS[source]
  if (!builder) {
    console.warn(`[questionEngine] Unknown source: ${source}`)
    return []
  }
  return builder(filter, count, masteryScores)
}

// Exported individually as well, for callers that want to mix sources
// themselves (e.g. a future game blending vocabulary and quiz
// questions in one session) rather than only through getQuestions().
export { buildVocabularyQuestions, buildListeningQuestions, buildQuizQuestions, generateDistractors }
