<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Avatar from '@/components/base/Avatar.vue'
import Input from '@/components/base/Input.vue'
import Button from '@/components/base/Button.vue'

const props = defineProps({ player: String })
const router = useRouter()
const auth = useAuthStore()

const question = ref('')
const answer = ref('')
const error = ref('')
const shake = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    await (auth.players[props.player] ? Promise.resolve(auth.players[props.player]) : auth.fetchPlayer(props.player))
    const picked = auth.randomSecurityQuestion(props.player)
    question.value = picked?.question || ''
  } catch (e) {
    error.value = 'Gagal memuat profil: ' + e.message
  } finally {
    loading.value = false
  }
})

function confirm() {
  error.value = ''
  if (!answer.value.trim()) return
  if (auth.verifyAnswer(props.player, question.value, answer.value)) {
    sfx.win()
    auth.login(props.player)
    router.push({ name: 'dashboard' })
  } else {
    sfx.wrong()
    error.value = 'Jawabannya kurang pas, coba lagi ya.'
    shake.value = true
    setTimeout(() => (shake.value = false), 400)
  }
}
</script>

<template>
  <AuthLayout>
    <div class="login-header">
      <Avatar :initials="player?.[0]" :alt="player" size="lg" class="login-header__avatar" />
      <span class="login-header__eyebrow">Konfirmasi Identitas</span>
      <h1 class="login-header__title">Halo, {{ player }} 👋</h1>
    </div>

    <div v-if="loading" class="login-card login-card--loading">Memuat...</div>

    <div v-else class="login-card" :class="{ 'login-card--shake': shake }">
      <p class="login-card__prompt">Jawab pertanyaan keamananmu dulu:</p>
      <p class="login-card__question">{{ question }}</p>
      <Input
        v-model="answer"
        placeholder="Jawabanmu..."
        :error-text="error"
        autofocus
        @keyup.enter="confirm"
      />
      <Button variant="primary" block class="login-card__submit" @click="confirm">
        Masuk
      </Button>
    </div>

    <router-link to="/" class="login-switch" @click="sfx.click()">
      Bukan {{ player }}? Ganti profil
    </router-link>
  </AuthLayout>
</template>

<style scoped>
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--space-6);
}

.login-header__avatar {
  margin-bottom: var(--space-3);
}

.login-header__eyebrow {
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--text-caption-tracking);
  text-transform: var(--text-caption-transform);
  color: var(--brand-primary);
  margin-bottom: var(--space-2);
}

.login-header__title {
  font-family: var(--text-display-lg-family);
  font-size: var(--text-display-lg-size);
  line-height: var(--text-display-lg-leading);
  font-weight: var(--text-display-lg-weight);
  color: var(--text-primary);
  margin: 0;
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background-color: var(--surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.login-card--loading {
  text-align: center;
  padding: var(--space-10) var(--space-6);
  color: var(--text-secondary);
}

.login-card--shake {
  animation: login-card-shake 0.4s ease;
}

@keyframes login-card-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

.login-card__prompt {
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
  margin: 0;
}

.login-card__question {
  font-family: var(--text-heading-md-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--text-primary);
  margin: 0;
}

.login-switch {
  display: block;
  text-align: center;
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
  text-decoration: underline;
  margin-top: var(--space-4);
}

@media (prefers-reduced-motion: reduce) {
  .login-card--shake {
    animation: none;
  }
}
</style>
