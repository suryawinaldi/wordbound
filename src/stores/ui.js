// ui store — presentation-only global state: loading flags and the
// current responsive breakpoint. Deliberately holds no domain data and
// is never read by domain stores (player/progress/auth), only by
// components — the one-way dependency rule from the Frontend
// Architecture Blueprint's store plan that keeps presentation and
// domain state from circularly depending on each other.
//
// Does not track modal/toast queues — ModalLayer.vue and
// OverlayLayer.vue (Step 12) already own that state locally via
// provide/inject, which is the right scope for it while no Pinia-backed
// notifications store exists yet.

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
}

export const useUiStore = defineStore('ui', () => {
  const loadingFlags = ref({})
  const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.desktop)

  const activeBreakpoint = computed(() => {
    if (viewportWidth.value >= BREAKPOINTS.desktop) return 'desktop'
    if (viewportWidth.value >= BREAKPOINTS.tablet) return 'tablet'
    return 'mobile'
  })

  const isDesktop = computed(() => activeBreakpoint.value === 'desktop')
  const isMobile = computed(() => activeBreakpoint.value === 'mobile')

  function setLoading(key, value) {
    loadingFlags.value = { ...loadingFlags.value, [key]: !!value }
  }

  function isLoading(key) {
    return !!loadingFlags.value[key]
  }

  const isAnyLoading = computed(() => Object.values(loadingFlags.value).some(Boolean))

  function handleResize() {
    viewportWidth.value = window.innerWidth
  }

  // Registered once per store instance (Pinia stores are singletons per
  // app, so this listener is never duplicated). No onMounted/
  // onBeforeUnmount pairing issue here since a store's setup() runs once
  // outside any component's lifecycle — these hooks are only meaningful
  // if this store happens to be used inside a component's own setup, so
  // the listener is attached directly instead.
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }

  return {
    loadingFlags,
    viewportWidth,
    activeBreakpoint,
    isDesktop,
    isMobile,
    isAnyLoading,
    setLoading,
    isLoading,
  }
})
