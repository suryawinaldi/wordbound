<!--
  AuthLayout.vue — Layout

  Wraps Splash, Login, and Profile Setup. Deliberately excludes any
  navigation shell — there is nothing to navigate to yet before a
  session exists — using a simpler, centered composition instead of
  AppShell's header/nav/main/footer structure.

  Contains no application state, no routing logic, and no
  authentication logic — purely structural, like AppShell.

  Slots:
    default — the page content (Splash/Login/Profile Setup markup).
-->
<script setup>
// Intentionally no props, no reactive state, and no imports — a pure
// structural layout, matching AppShell.vue's own convention.
</script>

<template>
  <div class="wb-auth-layout">
    <div class="wb-auth-layout__panel">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.wb-auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-6);
  padding-top: max(var(--space-6), env(safe-area-inset-top));
  padding-bottom: max(var(--space-6), env(safe-area-inset-bottom));
  padding-left: max(var(--space-6), env(safe-area-inset-left));
  padding-right: max(var(--space-6), env(safe-area-inset-right));
  background-color: var(--bg-default);
}

.wb-auth-layout__panel {
  width: 100%;
  max-width: 26rem;
}
</style>
