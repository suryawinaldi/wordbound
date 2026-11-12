import { HEROES, ROSTER, PENDING_HEROES } from "../src/features/hero-hunt/content.js";
import { ML_HEROES } from "../src/data/ml-heroes.js";
import { validateHeroes, validateRoster } from "../src/features/hero-hunt/engine.js";
const release = process.argv.includes("--release");
const errors = [...validateRoster(ROSTER), ...(release ? validateHeroes(HEROES, { release }) : [])];
for (const hero of ML_HEROES) {
  if (!ROSTER.some((item) => item.name === hero.name))
    errors.push(`Missing legacy roster entry: ${hero.name}`);
}
if (release && PENDING_HEROES.length)
  errors.push(`${PENDING_HEROES.length} roster entries still require source verification`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `${ROSTER.length} roster entries accounted for; ${HEROES.length} playable heroes / ${HEROES.length * 5} clues passed ${release ? "release" : "preview structure"} validation. ${PENDING_HEROES.length} entries remain blocked.`,
  );
}
