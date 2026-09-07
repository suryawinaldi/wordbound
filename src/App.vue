<script setup>
import { RouterView } from 'vue-router'
import MuteToggle from '@/components/MuteToggle.vue'
</script>

<template>
  <div class="app-container">
    <div class="bg-orbs" aria-hidden="true">
      <span class="orb orb-gold"></span>
      <span class="orb orb-surya"></span>
      <span class="orb orb-almira"></span>
    </div>
    <MuteToggle />
    <RouterView v-slot="{ Component, route: r }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="r.fullPath" />
      </transition>
    </RouterView>
  </div>
</template>

<style>
.fade-enter-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(.2,.9,.3,1.2);
}
.fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
}
</style>
