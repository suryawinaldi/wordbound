<script setup>
import { ref } from 'vue'
import { isMuted, toggleMuted, sfx } from '@/lib/sound'

const muted = ref(isMuted())

function toggle() {
  muted.value = toggleMuted()
  if (!muted.value) sfx.click()
}
</script>

<template>
  <button class="mute-btn" :title="muted ? 'Bunyikan suara' : 'Matikan suara'" @click="toggle">
    {{ muted ? '🔇' : '🔊' }}
  </button>
</template>

<style scoped>
.mute-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 40;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.mute-btn:hover {
  transform: scale(1.08);
}
</style>
