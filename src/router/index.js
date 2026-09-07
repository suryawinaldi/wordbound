import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'splash', component: () => import('@/views/SplashView.vue') },
    { path: '/couple-link', name: 'couple-link', component: () => import('@/views/CoupleLinkView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/quiz', name: 'quiz', component: () => import('@/views/QuizSoloView.vue'), meta: { requiresAuth: true } },
    { path: '/duel', name: 'duel', component: () => import('@/views/WordleDuelView.vue'), meta: { requiresAuth: true } },
    { path: '/speedround', name: 'speedround', component: () => import('@/views/SpeedRoundView.vue'), meta: { requiresAuth: true } },
    { path: '/listen', name: 'listen', component: () => import('@/views/ListenGameView.vue'), meta: { requiresAuth: true } },
    { path: '/leveltest', name: 'leveltest', component: () => import('@/views/LevelTestView.vue'), meta: { requiresAuth: true } },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue'), meta: { requiresAuth: true } },
  ],
})

if (import.meta.env.DEV) {
  router.addRoute({
    path: '/design-system',
    name: 'design-system',
    component: () => import('@/views/DesignSystemView.vue'),
  })
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Wait for auth to initialize
  if (!auth.authReady) {
    await new Promise((resolve) => {
      const unwatch = watch(() => auth.authReady, (ready) => {
        if (ready) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const isLoggedIn = !!auth.currentUser
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'splash' }
  }

  if (isLoggedIn && to.name === 'splash') {
    return { name: 'dashboard' } 
  }
})

export default router
