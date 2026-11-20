# Content review — 20 November 2026

This is a coverage audit, **not a factual certification of MLBB data**.

- Legacy roster: 133 names, each retained in the new roster manifest.
- Playable editorial preview: 133 heroes, 665 clues.
- Blocked entries: 0.
- Clues with completed official patch review: **0**.
- Rewritten clues avoid copied voice lines, skin counts, item builds and release-date claims. Automated tests cover count, IDs, aliases, duplicate/empty clues, answer leakage and playable engine behavior. They cannot establish lore/skill accuracy or progressive difficulty.

On 20 November, five Indonesian clues per hero were authored for Hirara, Kalea, Lukas, Marcel, Obsidia, Sora and Zetian using their MLBB Tools hero profiles. Those entries link to the profiles in the in-game library. Official patch verification remains pending.

For every hero, compare the roster, current skills and stable lore with official/in-game material. The wiki links in `content.js` are unvisited review references, not proof. Record an actual source excerpt/location and review date, version/patch when applicable, and reviewer for each clue. Check ambiguity and ordering with human playtesting. Only then set verified statuses. `npm run check:release` refuses the current dataset, including hero-level flags without per-clue evidence.

The old twelve-hero preview has not been discarded: its IDs and compatible storage version are retained. Old local results remain readable; no Firebase documents or user data were modified.
