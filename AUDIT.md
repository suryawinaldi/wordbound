# WordBound — Base Component Design System Audit

**Scope:** Button, Input, Badge, Avatar, Tabs, Dropdown, Toast, Modal, Search
**Method:** every file read directly for this audit (not from memory), cross-compared file-by-file for each checklist category below.

---

## 1. API Consistency

**Consistent across the library:**
- `disabled` (Button, Input, Badge, Avatar, Dropdown), `loading` (Button, Input, Dropdown, Search, Avatar), `clearable` (Input, Dropdown, Search), `helperText`/`errorText` (Input, Dropdown) — all boolean/string types used identically everywhere they appear.
- The clickable-or-plain dynamic-root pattern (`rootTag` computed to `'button'` or `'span'`, plus a matching `disabled` prop that's only meaningful in clickable mode) is implemented identically in Badge and Avatar.

**Inconsistencies found:**

1. **Avatar's `variant` prop means something different from every other component's `variant`.** In Button, Badge, and Dropdown (implicitly, via `effectiveVariant`), `variant` selects a *visual style*. In Avatar, `variant` selects a *presence status* (`online`/`away`/`offline`/`default`) — a completely different concept reusing the same prop name. This is the single most significant naming inconsistency found.
   - **Not fixed** — renaming this (e.g. to `status`) would be a breaking change to Avatar's public prop API, which is outside "fix inconsistencies without changing functionality." Flagging for your explicit decision on a future dedicated rename pass.

2. **Tabs and Dropdown model the same underlying concept (a list of labeled, optionally-disabled selectable entries) with different shapes:** Tabs' `items` use `{ id, label, disabled }`; Dropdown's `options` use `{ value, label, disabled }`. Neither is wrong, but they don't match each other.
   - **Not fixed** — same reasoning as above; unifying this would change both components' public prop shape.

3. **Only Input.vue exposed a public `focus()` method** (via `defineExpose`) prior to this audit, despite Button, Badge (clickable), and Avatar (clickable) being equally legitimate, equally focusable interactive elements. Search's own `autofocus` feature only works *because* Input happens to expose this — the same need would have hit a wall against Button/Badge/Avatar.
   - **Fixed** — see §6 below.

---

## 2. Vue Consistency

| Component | `inheritAttrs: false` + `useAttrs` | Dev-mode accessible-name guard | `defineExpose` |
|---|---|---|---|
| Button | ✅ | ✅ | ✅ *(added)* |
| Input | — | — | ✅ (`focus`) |
| Badge | ✅ | ✅ | ✅ *(added)* |
| Avatar | ✅ | ✅ | ✅ *(added)* |
| Tabs | — | — | — |
| Dropdown | ✅ | ✅ | — |
| Toast | — | — | — |
| Modal | — | ✅ *(added)* | — |
| Search | — | — (documented as intentionally unnecessary) | — |

The blank cells are **not all the same kind of gap** — worth being precise rather than treating every blank as a bug:
- **Tabs** doesn't need the guard: each tab's accessible name is its own literal `label` text, always present by the prop's own type contract.
- **Toast** doesn't need it in the same sense: `title`/`description` are the *content*, not a label describing a separate control — an empty toast is a content-authoring mistake, not a missing-accessible-name defect in the same category as the others.
- **Search** explicitly documented in its own header comment why it's exempt (always renders a real associated `<label>` regardless of visibility).
- **Modal** was a genuine gap, not a justified exception — see §3 finding #1, now fixed.

---

## 3. Accessibility

**Finding (fixed):** `Modal.vue` had no way to give the dialog an accessible name when no `title` prop and no labeled `header` slot content were provided — a real WCAG 4.1.2 (Name, Role, Value) failure, not just a style inconsistency. Confirmed this wasn't theoretical: the existing "Custom header slot" demo in `DesignSystemView.vue` was itself in exactly this state (no `title`, a `header` slot with no `aria-labelledby` wiring).
- **Fix applied:** added an optional `ariaLabel` prop to `Modal.vue`, bound to `aria-label` on the dialog only when `title` is absent (so `aria-labelledby` always takes precedence when both exist), plus the same dev-mode console warning pattern used by Button/Badge/Avatar/Dropdown. Updated the "Custom header slot" demo to pass `aria-label="Almira's level up celebration"`, closing the gap in the one place it was already occurring.

**Everything else checked and found consistent:**
- Focus-visible pattern is identical everywhere it applies: `outline: none` on `:focus`, `box-shadow: var(--shadow-focus-ring)` on `:focus-visible`. Dropdown's trigger and Input additionally pair this with `border-color: var(--border-focus)` — a deliberate, justified difference (both are bordered form controls; Button/Badge/Avatar/Toast's dismiss/Modal's close are borderless icon-style elements), not an inconsistency.
- Keyboard support (arrow keys, Home/End, Enter, Escape, Tab-trapping where relevant) matches each component's own written spec in every case checked.
- `role`/`aria-*` usage is correct and non-redundant everywhere (combobox+listbox+option in Dropdown; tablist+tab+tabpanel in Tabs; dialog+aria-modal in Modal; status/alert+aria-live in Toast).

---

## 4. Design Consistency (tokens, spacing, typography, radius, elevation, transitions)

- Every component reads exclusively from `tokens.css` — no raw hex/rgba literals found anywhere in the final, shipped files (Modal's one violation, `rgba(15, 61, 46, 0.45)`, was caught and fixed during Step 9 itself, not left for this audit).
- Small icon-buttons (Input's clear/eye toggle, Dropdown's clear button, Toast's dismiss, Modal's close) all consistently use `--radius-sm`.
- Spinner animation is byte-for-byte consistent across Button, Input, and Dropdown: `0.7s linear infinite`, same border-ring construction.

**Finding (fixed):** `Avatar.vue`'s `.wb-avatar--clickable` transitioned only `transform`, but its hover state changes `filter` (brightness dim) — the identical interaction Badge implements on `.wb-badge--clickable`, where `filter` *is* included in the transition list. Avatar's hover dim was snapping instantly instead of fading, and its `prefers-reduced-motion` override removed the `filter` transition entirely rather than keeping it (as Badge correctly does — reduced motion should remove *movement*, not all transitions; a non-spatial color/brightness fade isn't disorienting the way motion is).
- **Fix applied:** added `filter var(--duration-fast) var(--ease-standard)` to Avatar's clickable transition list, and changed its reduced-motion override from `transition: none` to `transition: filter var(--duration-fast) linear`, matching Badge's pattern exactly.

---

## 5. Performance

- No unnecessary watchers found. Every `watch` call in the library (Input's `src`-reset watcher in Avatar terms — actually Avatar's own `src` watch, Dropdown's `options` watch, Modal's `modelValue` watch, Tabs' `activeId` watch) has a clear, singular, necessary purpose tied to real state synchronization, not incidental.
- Computed properties are all genuinely derived values (no computed that could just as easily be a plain function or that recomputes something cheap-to-inline).
- No component holds reactive state it doesn't read from in its own template — nothing found that would cause an unnecessary re-render.

No fixes needed in this category.

---

## 6. CSS Review

- No duplicated `<style>` blocks found — each component's styles are self-contained and scoped; the *visual language* is intentionally repeated (by design, via shared tokens) but the CSS declarations themselves are not copy-pasted verbatim between files.
- No inline `style="..."` attributes anywhere across all nine components.
- No hardcoded colors, spacing, radius, shadow, or transition values remain in any of the nine files as of this audit (Avatar's transition gap in §4 was a missing *token reference*, not a hardcoded value — it fixed to a token, not a literal).

**Fixes applied this audit (summarized from above):**
1. `Modal.vue` — added `ariaLabel` prop + `aria-label` binding + dev-mode warning (accessibility fix).
2. `Button.vue`, `Badge.vue`, `Avatar.vue` — added a root template ref + `defineExpose({ focus })`, matching Input.vue's existing exposed API (consistency fix, purely additive, no existing behavior changed).
3. `Avatar.vue` — added the missing `filter` transition and corrected its reduced-motion override (CSS bug fix).
4. `DesignSystemView.vue` — one demo (`modalCustomHeaderDemo`) updated to supply the newly-available `aria-label`, closing the exact gap fix #1 addresses.

---

## 7–9. Component Architecture, Folder Structure, Naming Conventions

- Folder placement (`src/components/base/`) is consistent for all nine files — no component ended up in the wrong tier.
- `wb-` prefix + BEM-style `__`/`--` modifier naming is used identically in every component's CSS classes, with zero exceptions found.
- Compositional reuse (Tabs→Badge, Toast→Button, Search→Input) is applied consistently and is exactly the pattern the Frontend Architecture Blueprint calls for — no component reimplements another's already-solved concern.
- The two prop-naming inconsistencies in §1 (Avatar's `variant`, Tabs/Dropdown's `items`/`options`) are the only real naming inconsistencies found across all nine components — everything else (event names, boolean prop names, slot names) is consistent.

---

## 10. Production Readiness

All nine components, after the fixes above, are free of TODOs, placeholders, hardcoded design values, and now have consistent `defineExpose`/accessible-name-guard coverage everywhere it's genuinely applicable. The two remaining naming inconsistencies (§1, items #1–2) are real but are **naming/API-shape concerns, not defects** — they don't affect correctness, accessibility, or visual behavior, which is why they're reported rather than silently changed.

---

## Summary

**Fixes were required and have been applied** to 5 files: `Button.vue`, `Badge.vue`, `Avatar.vue`, `Modal.vue`, and `DesignSystemView.vue`. No component was redesigned; no new features were added; no public prop was renamed or removed. Every change is additive (a new optional prop, a new exposed method, a corrected transition value) and does not alter any currently-verified behavior from Steps 1–10.

**Reported but intentionally not changed** (would alter public API shape): Avatar's `variant`/status naming, and the `items`/`options` shape mismatch between Tabs and Dropdown. Recommend addressing both, if at all, as a deliberate, separately-reviewed rename pass — not bundled into a "no functional change" audit.
