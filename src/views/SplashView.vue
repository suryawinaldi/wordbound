<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/components/base/Button.vue'

const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
  sfx.click()
  await auth.loginWithGoogle()
  if (auth.currentUser) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <AuthLayout>
    <div class="splash-hero">
      <span class="splash-hero__eyebrow">✨ WordBound</span>
      <h1 class="splash-hero__title">Belajar bareng,<br />tebak bareng.</h1>
      <p class="splash-hero__subtitle">Kuis, duel Wordle, &amp; speed round bersama pasangan.</p>
    </div>

    <div class="splash-actions">
      <Button 
        variant="primary" 
        size="lg" 
        :loading="auth.loading"
        @click="handleLogin"
        class="login-btn"
      >
        <template #icon>
          <!-- Simple Google SVG Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </template>
        Lanjutkan dengan Google
      </Button>
      <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>
    </div>
  </AuthLayout>
</template>

<style scoped>
.splash-hero {
  text-align: center;
  margin-bottom: var(--space-8);
}

.splash-hero__eyebrow {
  display: inline-block;
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--text-caption-tracking);
  text-transform: var(--text-caption-transform);
  color: var(--brand-primary);
  margin-bottom: var(--space-3);
}

.splash-hero__title {
  font-family: var(--text-display-xl-family);
  font-size: var(--text-display-xl-size);
  line-height: var(--text-display-xl-leading);
  font-weight: var(--text-display-xl-weight);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.splash-hero__subtitle {
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-leading);
  color: var(--text-secondary);
  margin: 0;
}

.splash-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.login-btn {
  width: 100%;
  max-width: 300px;
  background-color: white !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-default) !important;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.error-msg {
  color: white;
  background-color: var(--semantic-error);
  font-size: var(--text-body-sm-size);
  font-weight: bold;
  text-align: center;
  padding: 8px 12px;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
}
</style>
