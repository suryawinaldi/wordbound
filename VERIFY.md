# Step 26 Verification (for your reference)

- `npm run dev` starts cleanly (not imported by any view/game yet).
- If you want to re-run the same runtime checks locally: temporarily create a small script that imports `getQuestions` from `src/games/engine/questionEngine.js` and calls it with `{ source: 'vocabulary', filter: {}, count: 10 }` — confirm you get 10 questions back, each with exactly 4 options including the correct answer.
- Try `{ source: 'vocabulary', filter: { cefr: ['A1'] }, count: 200 }` — every returned question's `cefr` should be `'A1'`.
- Try `{ source: 'bogus', filter: {}, count: 5 }` — should return `[]` and log a warning, not throw.
