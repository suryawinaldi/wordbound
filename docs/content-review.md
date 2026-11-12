# Content review — 12 November 2026

This is a coverage audit, **not a factual certification of MLBB data**.

- Legacy roster: 133 names, each retained in the new roster manifest.
- Playable editorial preview: 126 heroes, 630 rewritten clues.
- Blocked entries: 7, excluded from session sampling and clearly labeled in `/heroes`.
- Externally verified clues: **0**. Official-site and community-wiki access remains blocked by the environment's outbound policy.
- Rewritten clues avoid copied voice lines, skin counts, item builds and release-date claims. Automated tests cover count, IDs, aliases, duplicate/empty clues, answer leakage and playable engine behavior. They cannot establish lore/skill accuracy or progressive difficulty.

| Entry   | Why it is not playable yet                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| Hirara  | The original row is generic placeholder text; roster identity and abilities require an authoritative source. |
| Kalea   | The original row lacks five specific facts.                                                                  |
| Lukas   | The original row lacks five specific facts.                                                                  |
| Marcel  | Release and ability claims have no supporting reference evidence.                                            |
| Obsidia | Release and ability claims have no supporting reference evidence.                                            |
| Sora    | Release and ability claims have no supporting reference evidence.                                            |
| Zetian  | The original mechanics description needs comparison against official information.                            |

Do not infer that a pending entry is nonexistent or unreleased. The evidence available here is insufficient to establish its current status.

For every hero, compare the roster, current skills and stable lore with official/in-game material. The wiki links in `content.js` are unvisited review references, not proof. Record an actual source excerpt/location and review date, version/patch when applicable, and reviewer for each clue. Check ambiguity and ordering with human playtesting. Only then set verified statuses. `npm run check:release` refuses the current dataset, including hero-level flags without per-clue evidence.

The old twelve-hero preview has not been discarded: its IDs and compatible storage version are retained. Old local results remain readable; no Firebase documents or user data were modified.
