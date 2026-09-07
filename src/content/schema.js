// content/schema.js — the unified content schema, per the Frontend
// Architecture Blueprint's Database Strategy (Part 6) and Master
// Implementation Blueprint Part 10 Step 22.
//
// This project is plain JavaScript, not TypeScript, so these are JSDoc
// typedefs rather than compiled types — genuinely useful for editor
// autocomplete/hover documentation even without a type-checker, and the
// one canonical place every content shape in src/content/*.js is
// defined against.
//
// These shapes replace the fragmented, ad hoc structures previously
// spread across src/data/word-bank.js, quiz-bank.js, and listen-bank.js
// (see the Architecture Review's finding on this exact fragmentation).
// The old files are NOT deleted or modified by this step — Steps 22–25
// are purely additive; existing game views keep working unchanged until
// a later milestone migrates them onto this new content layer and the
// Question Engine that will consume it (Step 26).

/**
 * @typedef {Object} LexicalItem
 * @property {string} id - Stable, unique identifier.
 * @property {string} text - The word/idiom/phrasal verb itself.
 * @property {string} translation - Indonesian translation/meaning.
 * @property {'A1'|'A2'|'B1'|'B2'|'C1'|'C2'} cefr - CEFR difficulty level.
 * @property {string|null} partOfSpeech - e.g. 'noun', 'verb'. Null where not yet tracked.
 * @property {string[]} tags - Free-form category tags (e.g. 'listen', 'wordle').
 * @property {'word'|'idiom'|'phrasalVerb'} type - Distinguishes the three lexical item kinds, which otherwise share this same shape.
 */

/**
 * @typedef {Object} ExampleSentence
 * @property {string} id - Stable, unique identifier.
 * @property {string} text - The English sentence.
 * @property {string} translation - Indonesian translation.
 * @property {'A1'|'A2'|'B1'|'B2'|'C1'|'C2'} cefr - CEFR difficulty level.
 * @property {string[]} relatedItemIds - LexicalItem ids this sentence exercises, if known.
 * @property {string[]} tags - Free-form category tags.
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id - Stable, unique identifier.
 * @property {'A1'|'A2'|'B1'|'B2'|'C1'|'C2'} cefr - CEFR difficulty level.
 * @property {string} tag - Question category (e.g. 'vocab', 'grammar', 'synonym').
 * @property {string} prompt - The question text.
 * @property {string[]} options - Multiple-choice options.
 * @property {number} correctIndex - Index into `options` of the correct answer.
 */

/**
 * @typedef {Object} ContentFilter
 * Used by the future Question Engine (Step 26) to select a slice of
 * content for a given game/mode.
 * @property {('A1'|'A2'|'B1'|'B2'|'C1'|'C2')[]} [cefr] - Restrict to these levels.
 * @property {string[]} [tags] - Restrict to items having at least one of these tags.
 * @property {('word'|'idiom'|'phrasalVerb')} [type] - Restrict LexicalItem queries to this type.
 */

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function isValidCefr(level) {
  return CEFR_LEVELS.includes(level)
}

/** Basic shape validation for a LexicalItem — used by content-authoring/tests, not at runtime by games. */
export function isValidLexicalItem(item) {
  return !!(
    item &&
    typeof item.id === 'string' &&
    typeof item.text === 'string' &&
    typeof item.translation === 'string' &&
    isValidCefr(item.cefr) &&
    Array.isArray(item.tags) &&
    ['word', 'idiom', 'phrasalVerb'].includes(item.type)
  )
}

/** Basic shape validation for an ExampleSentence. */
export function isValidExampleSentence(item) {
  return !!(
    item &&
    typeof item.id === 'string' &&
    typeof item.text === 'string' &&
    typeof item.translation === 'string' &&
    isValidCefr(item.cefr) &&
    Array.isArray(item.relatedItemIds) &&
    Array.isArray(item.tags)
  )
}

/** Basic shape validation for a QuizQuestion. */
export function isValidQuizQuestion(item) {
  return !!(
    item &&
    typeof item.id === 'string' &&
    isValidCefr(item.cefr) &&
    typeof item.prompt === 'string' &&
    Array.isArray(item.options) &&
    item.options.length > 0 &&
    Number.isInteger(item.correctIndex) &&
    item.correctIndex >= 0 &&
    item.correctIndex < item.options.length
  )
}
