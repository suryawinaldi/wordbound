import { spawnSync } from "node:child_process";

const target = process.argv.includes("--production")
  ? "production"
  : process.env.VERCEL_ENV || "preview";
if (
  process.env.VERCEL === "1" &&
  !process.env.VERCEL_ENV &&
  !process.argv.includes("--production")
) {
  throw new Error("Vercel build target is missing; refusing to assume this is a preview.");
}
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};
console.log(
  `Building Hero Hunt for ${target}. Production requires completed content verification.`,
);
run(["scripts/check-hero-content.js", ...(target === "production" ? ["--release"] : [])]);
run(["--test", "tests/hero-hunt.test.js"]);
run(["scripts/audit-hero-audio.js"]);
// A new directory prevents the tracked legacy dist snapshot from being deployed.
run(["node_modules/vite/bin/vite.js", "build", "--outDir", "dist-hero-hunt", "--emptyOutDir"]);
