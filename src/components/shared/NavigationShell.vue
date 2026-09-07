<!--
  NavigationShell.vue — Shared component

  Persistent app navigation. Renders as a fixed bottom tab bar on
  mobile/tablet and as an in-flow left rail on desktop (1024px+,
  matching AppShell.vue's own breakpoint) — same markup throughout,
  repositioned and restyled via CSS media query rather than conditional
  rendering, so there's no flash-of-wrong-layout on resize.

  Data-driven, not hardcoded: `items` is a required prop (mirroring the
  shape already established by Tabs.vue's own `items` prop, for
  consistency), so this component doesn't assume which destinations
  exist yet — real routes for Games/Garden/Couple/etc. are built in
  later milestones, and whoever wires this into the app decides what to
  pass in.

  Active-state detection reads the current route via useRoute() (a
  presentational concern, not "routing logic" in the sense of defining
  routes) the same way existing views already use useRoute()/RouterLink.

  Slots:
    icon (scoped, per item: { item }) — optional custom icon per
      destination. Falls back to rendering nothing but the label if not
      provided, same fallback philosophy as Tabs.vue's icon slot.
    player — optional content shown only in the desktop rail's footer
      (e.g. a future current-player avatar + streak), per the UI/UX
      Design System's description of the rail's bottom section. Hidden
      entirely on the mobile bottom-bar layout, where space is tighter.
-->
<script setup>
import { useRoute } from 'vue-router'

defineProps({
  /** [{ label, to, badge? }] — `to` is anything RouterLink accepts. */
  items: {
    type: Array,
    required: true,
    validator: (items) => items.every((item) => typeof item.label !== 'undefined' && typeof item.to !== 'undefined')
  }
})

const route = useRoute()

function isActive(to) {
  const targetPath = typeof to === 'string' ? to : to.path
  if (!targetPath) return false
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}
</script>

<template>
  <nav class="wb-nav-shell" aria-label="Primary">
    <ul class="wb-nav-shell__list">
      <li v-for="item in items" :key="item.label" class="wb-nav-shell__item">
        <RouterLink
          :to="item.to"
          class="wb-nav-shell__link"
          :class="{ 'wb-nav-shell__link--active': isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span v-if="$slots.icon" class="wb-nav-shell__icon" aria-hidden="true">
            <slot name="icon" :item="item" />
          </span>
          <span class="wb-nav-shell__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <div v-if="$slots.player" class="wb-nav-shell__player">
      <slot name="player" />
    </div>
  </nav>
</template>

<style scoped>
/* --------------------------------------------------------------------
   Mobile / tablet — fixed bottom tab bar, glassmorphism-appropriate:
   frosted, floating above content.
   -------------------------------------------------------------------- */
.wb-nav-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-nav);
  background-color: var(--surface-elevated);
  border-top: 1px solid var(--border-default);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
  padding-bottom: max(var(--space-2), env(safe-area-inset-bottom));
  padding-left: max(var(--space-2), env(safe-area-inset-left));
  padding-right: max(var(--space-2), env(safe-area-inset-right));
}

.wb-nav-shell__list {
  display: flex;
  justify-content: space-around;
  list-style: none;
  margin: 0;
  padding: 0;
}

.wb-nav-shell__item {
  flex: 1 1 0;
  min-width: 0;
}

.wb-nav-shell__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.wb-nav-shell__link:hover {
  color: var(--text-primary);
}

.wb-nav-shell__link--active {
  color: var(--brand-primary);
  background-color: var(--brand-tint);
}

.wb-nav-shell__link:focus {
  outline: none;
}
.wb-nav-shell__link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-nav-shell__icon {
  display: inline-flex;
  font-size: 1.25rem;
  line-height: 1;
}

.wb-nav-shell__label {
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  line-height: var(--text-caption-leading);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.wb-nav-shell__player {
  display: none;
}

/* --------------------------------------------------------------------
   Desktop — in-flow left rail, matching AppShell.vue's own 1024px
   breakpoint exactly.
   -------------------------------------------------------------------- */
@media (min-width: 1024px) {
  .wb-nav-shell {
    position: static;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 15rem;
    height: 100%;
    border-top: none;
    border-right: 1px solid var(--border-default);
    box-shadow: none;
    backdrop-filter: none;
    padding: var(--space-4);
    padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
  }

  .wb-nav-shell__list {
    flex-direction: column;
    gap: var(--space-1);
  }

  .wb-nav-shell__link {
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }

  .wb-nav-shell__label {
    font-family: var(--text-body-sm-family);
    font-size: var(--text-body-sm-size);
  }

  .wb-nav-shell__player {
    display: block;
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-default);
  }
}

/* --------------------------------------------------------------------
   Reduced motion
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-nav-shell__link {
    transition: none;
  }
}
</style>
