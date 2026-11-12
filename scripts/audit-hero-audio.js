import { ML_HEROES } from "../src/data/ml-heroes.js";
import { ROSTER } from "../src/features/hero-hunt/content.js";
import { AUDIO_REVIEWS, audioEligibility } from "../src/features/hero-hunt/audio-catalog.js";
import { existsSync, writeFileSync } from "node:fs";
const rows = ROSTER.map((hero) => {
  const legacy = ML_HEROES.find((item) => item.name === hero.name);
  const review = AUDIO_REVIEWS[hero.id];
  const eligibility = audioEligibility(review);
  if (eligibility.ready && !existsSync(`public${review.localAssetPath}`))
    throw new Error(`Missing reviewed asset: ${hero.id}`);
  return {
    id: hero.id,
    name: hero.name,
    legacyUrlPresent: !!legacy?.audioUrl,
    referencePage: `${hero.sourceUrl}/Audio`,
    kind: review?.kind || "unconfirmed",
    language: review?.language || "unconfirmed",
    skin: review?.skin || "unconfirmed",
    sourceStatus: review?.sourceStatus || "needs_review",
    licenseStatus: review?.licenseStatus || "not_verified",
    playbackStatus: review?.playbackStatus || "not_tested",
    enabled: eligibility.ready,
    blocker: eligibility.reason,
  };
});
const summary = {
  roster: rows.length,
  legacyUrls: rows.filter((row) => row.legacyUrlPresent).length,
  missingLegacyUrls: rows.filter((row) => !row.legacyUrlPresent).length,
  ready: rows.filter((row) => row.enabled).length,
};
if (process.argv.includes("--write"))
  writeFileSync("docs/audio-audit.json", `${JSON.stringify({ summary, heroes: rows }, null, 2)}\n`);
console.log(JSON.stringify(summary));
