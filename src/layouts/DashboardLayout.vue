<!--
  DashboardLayout.vue — Layout

  The specific arrangement for the Dashboard screen only (per the UI/UX
  Design System §6 and the Frontend Architecture Blueprint §3): a single
  primary column on mobile (Greeting, Continue-Learning, Missions, Quick
  Play), gaining a secondary desktop-only column (Garden, Stats,
  Achievements) at 1024px+. This is intentionally not a generic
  "layout for pages with lots of cards" — only DashboardView uses it, so
  it doesn't become an accidental catch-all for unrelated pages.

  Contains no application state, no routing logic, and no store access —
  purely structural, matching AppShell.vue/AuthLayout.vue's convention.

  Slots:
    primary   — the main column (Greeting, Continue-Learning, Missions,
                Quick Play).
    secondary — the desktop-only column (Garden, Stats, Achievements).
                Rendered but visually stacked below `primary` on mobile
                rather than hidden — nothing in it is lost on a small
                screen, it just reflows instead of sitting beside.
-->
<script setup>
// Intentionally no props, no reactive state, and no imports — a pure
// structural layout, matching AppShell.vue/AuthLayout.vue's convention.
</script>

<template>
  <div class="wb-dashboard-layout">
    <div class="wb-dashboard-layout__primary">
      <slot name="primary" />
    </div>
    <div class="wb-dashboard-layout__secondary">
      <slot name="secondary" />
    </div>
  </div>
</template>

<style scoped>
.wb-dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 72rem;
  margin: 0 auto;
}

.wb-dashboard-layout__primary,
.wb-dashboard-layout__secondary {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
}

@media (min-width: 1024px) {
  .wb-dashboard-layout {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--space-12);
  }

  .wb-dashboard-layout__primary {
    flex: 1 1 60%;
  }

  .wb-dashboard-layout__secondary {
    flex: 1 1 40%;
    max-width: 24rem;
  }
}
</style>
