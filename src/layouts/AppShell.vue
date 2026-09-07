<!--
  AppShell.vue — Layout

  The application's single, top-level structural layout. This file
  contains no application state, no routing logic, no authentication
  logic, and no store access — it exists purely to give every other
  piece of the app (Header, NavigationShell, page content, Footer,
  ModalLayer, OverlayLayer) a consistent, responsive place to render,
  via slots. Those pieces are built in later steps and will be passed
  into this shell from a parent (ultimately App.vue) — this component
  does not know or care what fills its slots.

  Slots:
    header     — top of the page (e.g. a future top bar, or nothing on
                 screens that don't need one).
    navigation — persistent app navigation. Deliberately unopinionated
                 about mobile-bottom-bar vs. desktop-rail — that
                 decision belongs to whatever component fills this slot
                 (a future NavigationShell). If that content uses fixed
                 positioning (as a bottom tab bar typically would), it
                 is naturally removed from this shell's normal document
                 flow regardless of this wrapper's own layout, so no
                 breakpoint-switching logic is needed here.
    default    — the current page's main content.
    footer     — bottom of the page (rarely used in a mobile-app-style
                 product, but supported).
    modal      — a fixed, full-viewport region for a future ModalLayer.
    overlay    — a fixed, full-viewport region for a future
                 OverlayLayer (toasts, reward popups, confetti).

  The modal/overlay slot wrappers use `pointer-events: none` so an
  empty slot never silently blocks clicks across the whole app; real
  content rendered into them is responsible for re-enabling its own
  pointer-events, the same way a real modal/toast would.

  Includes a standard "skip to main content" link and safe-area-aware
  padding on the header/footer regions — both are structural
  accessibility/layout concerns appropriate to a shell, not application
  logic.
-->
<script setup>
// Intentionally no props, no reactive state, and no imports: this
// component is a pure structural layout. Nothing here should ever need
// to change for this file to remain correct.
</script>

<template>
  <div class="wb-app-shell">
    <a href="#wb-app-shell-main" class="wb-app-shell__skip-link">Skip to main content</a>

    <header class="wb-app-shell__header">
      <slot name="header" />
    </header>

    <div class="wb-app-shell__body">
      <nav class="wb-app-shell__navigation" aria-label="Primary">
        <slot name="navigation" />
      </nav>

      <main id="wb-app-shell-main" class="wb-app-shell__main" tabindex="-1">
        <slot />
      </main>
    </div>

    <footer class="wb-app-shell__footer">
      <slot name="footer" />
    </footer>

    <div class="wb-app-shell__modal-layer">
      <slot name="modal" />
    </div>

    <div class="wb-app-shell__overlay-layer">
      <slot name="overlay" />
    </div>
  </div>
</template>

<style scoped>
.wb-app-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--bg-default);
}

/* --------------------------------------------------------------------
   Skip link — visually hidden until it receives keyboard focus, the
   standard accessible pattern for bypassing persistent header/nav.
   -------------------------------------------------------------------- */
.wb-app-shell__skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: var(--z-toast);
  padding: var(--space-2) var(--space-4);
  background-color: var(--surface-elevated);
  color: var(--brand-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.wb-app-shell__skip-link:focus {
  transform: translateY(0);
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

/* --------------------------------------------------------------------
   Header / Footer — safe-area-aware padding so content on notched or
   home-indicator devices never sits under the OS chrome.
   -------------------------------------------------------------------- */
.wb-app-shell__header {
  grid-row: 1;
  padding-top: max(var(--space-2), env(safe-area-inset-top));
  padding-left: max(var(--space-4), env(safe-area-inset-left));
  padding-right: max(var(--space-4), env(safe-area-inset-right));
}

.wb-app-shell__footer {
  grid-row: 3;
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
  padding-left: max(var(--space-4), env(safe-area-inset-left));
  padding-right: max(var(--space-4), env(safe-area-inset-right));
}

/* --------------------------------------------------------------------
   Body — navigation + main content. Mobile-first: stacked column;
   desktop widens into a row so a future rail-style navigation sits
   beside content instead of above it. Fixed-position navigation
   content (e.g. a mobile bottom tab bar) is unaffected by this, since
   fixed positioning removes an element from this flow regardless.
   -------------------------------------------------------------------- */
.wb-app-shell__body {
  grid-row: 2;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.wb-app-shell__navigation {
  flex-shrink: 0;
}

.wb-app-shell__main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-4);
  padding-left: max(var(--space-4), env(safe-area-inset-left));
  padding-right: max(var(--space-4), env(safe-area-inset-right));
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
}

.wb-app-shell__main:focus {
  outline: none;
}

@media (min-width: 1024px) {
  .wb-app-shell__body {
    flex-direction: row;
  }

  .wb-app-shell__main {
    padding: var(--space-8);
    padding-left: max(var(--space-8), env(safe-area-inset-left));
    padding-right: max(var(--space-8), env(safe-area-inset-right));
  }
}

/* --------------------------------------------------------------------
   Modal / Overlay layers — fixed, full-viewport, non-blocking when
   empty. Real content rendered into these slots (a future ModalLayer/
   OverlayLayer) is responsible for its own scrim, positioning, and
   re-enabling pointer-events on itself.
   -------------------------------------------------------------------- */
.wb-app-shell__modal-layer,
.wb-app-shell__overlay-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.wb-app-shell__modal-layer {
  z-index: var(--z-modal-scrim);
}

.wb-app-shell__overlay-layer {
  z-index: var(--z-overlay);
}

/* --------------------------------------------------------------------
   Reduced motion — the only motion in this file is the skip link's
   reveal-on-focus; degrade it to an instant appearance.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-app-shell__skip-link {
    transition: none;
  }
}
</style>
