# Hero Hunt

A mobile-first, Indonesian MLBB hero guessing game built on the existing React/Vite project. This implementation covers the redesigned guest Solo experience: home → five-hero session → reveal → results, with local statistics and settings.

**Hero Hunt includes editorial-preview clues.** All 133 names in the legacy repository are now accounted for. The playable preview contains 133 heroes and 665 clues. These counts describe repository coverage, not the latest official MLBB roster. Source verification is pending: attempts to access the official MLBB site and community wiki were denied by the current environment proxy. Each clue has a source reference and individual review/evidence fields. `sourceUrl` is a review reference, not evidence of verification; all 665 clues still require external source review. No claim is made that these facts match the current game patch. `npm run check:release` intentionally fails while this remains unresolved.

## Run

Requires Node.js `^22.18.0 || >=24.12.0`. Validated with Node 24.22.1 and npm 11.9.0.

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Use the existing checkout at `/workspace/wordbound`; cloud tasks are already isolated. No additional Git worktree is needed. Solo makes no Firebase, OAuth, font CDN, artwork, or voice-line requests. No credentials or environment variables are required. Live processes must be restarted in a new cloud task.

## Checks

```sh
npm test
npm run check:content
npm run build -- --outDir node_modules/.cloud-build
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort --outDir node_modules/.cloud-build
```

The output override avoids rewriting the legacy tracked `dist` files. Do not deploy those old files as the new application. To preview this implementation, serve the newly built output above.

Browser tests use Python Playwright and Chromium (provided by the current cloud environment), exercise the UI without mocking gameplay, and assert that Solo makes no external requests:

```sh
npm run test:e2e                         # dev server on port 5173
HUNT_BASE_URL=http://localhost:4173 npm run test:e2e  # production preview
```

Set `CHROMIUM_PATH` if Chromium is installed somewhere other than `/usr/bin/chromium`. On another machine install Python Playwright and Chromium through trusted package sources. Checks cover session completion, scoring, game over, skip/exit confirmations, browser back, refresh/reveal recovery, storage failure/corruption, history deduplication, legacy redirects, keyboard navigation, reduced motion and 360/390/1440px layouts. The shortened-viewport check simulates keyboard space constraints; actual iOS/Android keyboards still require device testing.

## Game rules

- Five heroes sampled without replacement with Fisher–Yates. Normal is the default.
- Easy: 8 HP, 80 base points. Normal: 5 HP, 100 base points. Hard: 3 HP, 120 base points.
- A wrong answer costs 1 HP. Each additional clue costs 15 **potential points**, never coins or HP.
- Correct score: `max(10, base - 15 * extraClues - 10 * wrongGuesses)`.
- Names are Unicode-normalized, case-insensitive and punctuation-insensitive; only curated aliases are accepted. No fuzzy matching.
- Skip requires confirmation and awards zero points without losing HP. Correct and skipped heroes have an explicit reveal/continue step.
- HP is session-wide. At zero HP, results include completed rounds and the failed hero.
- Accuracy = correct guesses / (correct + wrong guesses). Skips are reported separately.
- Every action carries a revision so stale/double submissions cannot score twice.

## Storage and migration

`src/features/hero-hunt/` contains the new UI, pure engine, curated preview dataset and Zustand store. The public router only exposes `/`, `/play`, `/play/solo`, `/results/:sessionId`, `/stats`, `/profile` and `/heroes`. The hero library supports name/alias search and available/pending filters. Legacy URLs redirect home; legacy modules remain in Git for staged migration and are not imported into the Solo bundle.

Active sessions use `sessionStorage` (`hero-hunt.session.v1`) and survive refresh within the same tab. Results (latest 50) and settings use `localStorage` with `hero-hunt.*.v1` keys. Results are saved once per session ID. Storage failure leaves gameplay usable and shows a warning; invalid/incompatible stored sessions are discarded. Version-1 sessions/results remain compatible with the expanded version-2 roster. No old Wordbound/DuoBloom storage, Firebase accounts or documents are deleted or migrated. Local scores are personal records, not trusted competitive scores.

Gantian, Duel and Co-op are labeled upcoming. Google sign-in and cloud sync are not connected in this phase. The prior arbitrary URL audio proxy now returns HTTP 410; no user-supplied URL is fetched. Sound effects are generated locally. Artwork is an original abstract SVG emblem, not an MLBB portrait.

## Editorial verification

1. Review each clue against official/in-game sources, record source and patch/date evidence, and perform the independent editorial review specified in PRD v2.0. Replace or disable unverified content; do not simply change status flags to bypass the gate.
2. Complete the per-clue provenance fields (`reviewStatus`, `verifiedAt`, `reviewer`, `patch`, `evidence`). The release gate checks each of the five clues; setting only the hero-level flag cannot satisfy it.
3. Use `npm run check:release` to audit editorial evidence separately from deployment.
4. Perform physical-device keyboard/screen-reader checks and performance measurement. The current checks are not a Lighthouse benchmark or full accessibility audit.
5. Add authenticated persistence and online modes only with server-side validation, tested security rules, idempotent writes and multi-client testing. Those gates are not satisfied by this local implementation.

## Vercel deployment

Confirmed deployment target: existing project **wordbound**, team **suryawinaldi-1122**, at https://vercel.com/suryawinaldi-1122/wordbound. Do not create a replacement project. Once access is available, resolve the real project/team IDs with Vercel and link using `vercel link --project wordbound --scope suryawinaldi-1122 --yes`; do not fabricate `.vercel/project.json` IDs. Pushes to main trigger Production on this project.

`vercel.json` explicitly uses Vite, `npm ci`, `npm run build:vercel`, and the new `dist-hero-hunt` output directory. It no longer forwards Firebase auth requests. Static SPA deep links resolve to `index.html`; `/api/*` is excluded from that rewrite. The retired audio API still returns 410. `.vercelignore` excludes environment files, Git metadata, dependency caches, old builds and PDFs.

```sh
npm run build:vercel                   # checked local preview build
npm run preview -- --outDir dist-hero-hunt --port 4173 --strictPort
HUNT_BASE_URL=http://localhost:4173 npm run test:e2e
npm run build:release                  # checked production build
```

The Vercel build runs content checks and all Node tests before generating output. The strict editorial audit is available with `npm run check:release`. Unknown targets on a Vercel build are rejected instead of silently being treated as preview. `dist` is a legacy snapshot and must not be deployed.



Continue by activating the Vercel connector or logging in through the normal Vercel account flow. A `VERCEL_TOKEN` can alternatively be supplied securely in environment settings; never paste it into source or chat. Confirm the existing project/team before linking and deploying. From this workspace the pinned CLI is:

```sh
npm exec --cache /workspace/.npm --yes --package=vercel@65.14.0 -- vercel whoami --global-config /workspace/.vercel-cli
```

The current runtime also denies outbound access to the official MLBB site and `api.vercel.com` (proxy CONNECT 403). New domain additions are saved in the environment draft, not yet applied to the running instance. After settings are saved, check fresh connections, complete source review, authenticate Vercel, deploy the appropriate target, and run the browser suite against the returned HTTPS URL. Do not mark deployment complete on the basis of a local build or dry run.

See [content review](docs/content-review.md) for source coverage and remaining editorial requirements.

Hero Hunt is a fan-made trivia project and is not affiliated with MOONTON Games.

## Clue profiles and voice selection

Solo setup now offers **Campuran** (default for new sessions) and **Kisah & mekanik**. Mixed replaces only clue 2 with the complete role list, keeping the other four authored clues and the five-step scoring structure. Role is not lane. The selected profile is captured in the session; changing preferences cannot alter an active round. Legacy sessions without a profile keep their original authored clues. Scores remain personal preview records; both profiles currently share the same local scoreboard.

Role facts have their own source/review metadata and are still editorial previews, not current-patch certifications. The strict editorial audit also requires role evidence. Gender is explicitly null until a source confirms it; it is never inferred from artwork, pronouns, role, or paired-character names. No generic gender clue is inserted.

Tebak Suara draws five distinct heroes at page entry. When the player taps Play, the browser streams the selected recording as a small bundled MP3 from the game domain. Reviewed catalog entries take priority for the same hero. The playable deck covers 133 heroes, including 107 selection clips and 26 recordings sourced from MLBB Tools (24 showcase and two character dialogue clips). Source attribution and editorial or license review are tracked separately from playback. A failed stream can be retried or skipped.

Run `npm run audit:audio` to check the catalog or `node scripts/audit-hero-audio.js --write` to refresh the report. `AUDIO_REVIEWS` is currently empty. Before adding an asset it must have confirmed default-skin selection kind, matching English language, source evidence, license evidence, playback evidence, reviewer, spoiler clearance and a bundled `/audio/hero-hunt/` path. The build checks that every eligible file actually exists. No arbitrary URL proxy is used. Future gameplay must replace a failed audio round without taking HP; this behavior is described as planned, not implemented playback.

### Room “Siapa hero gue?”

Buka `/play/room` pada dua hingga sembilan browser, buat room, lalu bagikan kode enam digit. Saat mencoba di LAN, jalankan `npm run dev -- --host 0.0.0.0` dan gunakan alamat IP komputer yang sama di semua perangkat. Vite menyimpan room lokal dalam memori hingga server dimulai ulang. Refresh pada tab yang sama menyambung kembali.

Untuk Vercel, hubungkan satu database Redis REST bersama dan pasang `UPSTASH_REDIS_REST_URL` serta `UPSTASH_REDIS_REST_TOKEN` (atau pasangan `KV_REST_API_URL` / `KV_REST_API_TOKEN`) pada environment deployment. Simpan token hanya di server. API menggunakan compare-and-set agar dua suara bersamaan tetap tercatat. Room kedaluwarsa setelah enam jam tanpa perubahan.

Deck room menggunakan seluruh koleksi [Sparkies01/Splash pada revisi 3e8e842](https://github.com/Sparkies01/Splash/tree/3e8e842e09dc77e5fccc2665389001c935f7b87b). Ada 133 folder hero dan 1.061 entri gambar, termasuk tampilan dasar. Nama hero dan skin mengikuti folder serta nama file sumber. Misalnya, deck room menampilkan “Hiara” sesuai ejaan koleksi. Pemilihan acak dilakukan per hero, kemudian per entri milik hero tersebut. Untuk splash yang dipakai beberapa entri, pemain dapat membuka potret pembanding. Kartu WebP disajikan dari aplikasi, dengan ID berdasarkan blob Git sumber. Untuk membangun ulang dari checkout revisi tersebut, jalankan `python scripts/import-party-splash.py /path/ke/Splash` dengan Pillow terpasang. Koleksi dikelola komunitas. MLBB dan karakter-karakternya merupakan milik pemegang hak masing-masing.

Pemain menjawab berdasarkan hero dasarnya. Voting selesai saat semua penjawab memilih atau setelah 30 detik. Saat seri atau mayoritas ragu, pemain bisa memperjelas satu kali. Tiga kesalahan membuka kartu, dan pemain tetap bisa ikut voting.


### Room and listening improvements

Rooms offer fast (30/15/15 seconds) and relaxed (90/30/45 seconds) turns, in-room host rematches, explicit leaving, and removal after two unattended question turns. Room credentials persist on the same browser across tabs. Background tabs poll less frequently. Joining and creation are rate-limited together to 30 attempts per minute per address.

Listening rounds allow three guesses, skipping, session recovery and local results. Solo history is retained beyond 50 sessions from this version onward. Previously discarded history cannot be recovered. Cross-device recovery, human calibration of clue difficulty, and full device audio quality checks still require further work.
