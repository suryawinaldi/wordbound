// ui store — presentation-only global state: loading flags and the
// current responsive breakpoint. Deliberately holds no domain data and
// is never read by domain stores (player/progress/auth), only by
// components — the one-way dependency rule from the Frontend
// Architecture Blueprint's store plan.

import { create } from 'zustand'

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
}

function getBreakpoint(width) {
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}

const initialWidth = typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.desktop

export const useUiStore = create((set, get) => {
  // Registered once per store instance (Zustand stores are singletons).
  // No cleanup needed since the store lives for the app's entire lifetime.
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      set({ viewportWidth: window.innerWidth })
    })
  }

  return {
    loadingFlags: {},
    viewportWidth: initialWidth,

    get activeBreakpoint() {
      return getBreakpoint(get().viewportWidth)
    },

    get isDesktop() {
      return get().viewportWidth >= BREAKPOINTS.desktop
    },

    get isMobile() {
      return get().viewportWidth < BREAKPOINTS.tablet
    },

    setLoading(key, value) {
      set((state) => ({ loadingFlags: { ...state.loadingFlags, [key]: !!value } }))
    },

    isLoading(key) {
      return !!get().loadingFlags[key]
    },

    get isAnyLoading() {
      return Object.values(get().loadingFlags).some(Boolean)
    },
  }
})
