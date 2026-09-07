<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/components/base/Button.vue'
import Input from '@/components/base/Input.vue'

const router = useRouter()
const auth = useAuthStore()

const inputCode = ref('')
const generatedCode = ref('')
const loadingLink = ref(false)
const generating = ref(false)
const error = ref('')

async function handleGenerate() {
  generating.value = true
  error.value = ''
  try {
    generatedCode.value = await auth.generateInviteCode()
  } catch (err) {
    error.value = err.message
  } finally {
    generating.value = false
  }
}

async function handleLink() {
  if (!inputCode.value || inputCode.value.length !== 6) {
    error.value = "Kode harus 6 angka"
    return
  }
  loadingLink.value = true
  error.value = ''
  try {
    await auth.linkWithCode(inputCode.value)
    // If successful, the watch below will redirect
  } catch (err) {
    error.value = err.message
  } finally {
    loadingLink.value = false
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

watch(() => auth.userData?.partnerUid, (newVal) => {
  if (newVal) {
    router.push({ name: 'dashboard' })
  }
})

</script>

<template>
  <AuthLayout>
    <div class="link-hero">
      <h1 class="link-hero__title">Temukan Pasanganmu</h1>
      <p class="link-hero__subtitle">
        WordBound dirancang untuk dimainkan berdua. 
        Hubungkan akunmu dengan pasangan untuk mulai bermain.
      </p>
    </div>

    <div class="link-cards">
      <!-- Opsi 1: Punya kode -->
      <div class="link-card">
        <h2 class="link-card__title">Punya Kode?</h2>
        <p class="link-card__desc">Masukkan 6 digit kode dari pasanganmu.</p>
        
        <div class="link-form">
          <Input 
            v-model="inputCode" 
            placeholder="Contoh: 123456" 
            maxlength="6"
            class="code-input"
          />
          <Button 
            variant="primary" 
            :loading="loadingLink"
            :disabled="inputCode.length !== 6"
            @click="handleLink"
          >
            Hubungkan
          </Button>
        </div>
      </div>

      <div class="divider"><span>ATAU</span></div>

      <!-- Opsi 2: Buat kode -->
      <div class="link-card">
        <h2 class="link-card__title">Buat Kode Baru</h2>
        <p class="link-card__desc">Bagikan kode ini agar pasanganmu bisa bergabung.</p>
        
        <div v-if="generatedCode" class="generated-code-box">
          <span class="the-code">{{ generatedCode }}</span>
          <p class="waiting-text">Menunggu pasanganmu bergabung...</p>
        </div>
        <Button 
          v-else 
          variant="secondary" 
          :loading="generating"
          @click="handleGenerate"
        >
          Buat Kode Invite
        </Button>
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <div class="link-footer">
      <Button variant="ghost" @click="handleLogout">Keluar</Button>
    </div>
  </AuthLayout>
</template>

<style scoped>
.link-hero {
  text-align: center;
  margin-bottom: var(--space-8);
}

.link-hero__title {
  font-family: var(--text-heading-lg-family);
  font-size: var(--text-heading-lg-size);
  font-weight: var(--text-heading-lg-weight);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.link-hero__subtitle {
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
}

.link-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.link-card {
  background: var(--surface-card);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  text-align: center;
}

.link-card__title {
  font-family: var(--text-heading-md-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  margin-bottom: var(--space-2);
}

.link-card__desc {
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.link-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.code-input {
  text-align: center;
  font-family: var(--text-numeric-lg-family);
  font-size: var(--text-numeric-lg-size);
  letter-spacing: 4px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-default);
}

.divider span {
  padding: 0 var(--space-3);
}

.generated-code-box {
  background: var(--bg-default);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-default);
}

.the-code {
  display: block;
  font-family: var(--text-numeric-lg-family);
  font-size: var(--text-numeric-lg-size);
  font-weight: var(--font-weight-bold);
  letter-spacing: 8px;
  color: var(--brand-primary);
  margin-bottom: var(--space-2);
}

.waiting-text {
  font-size: var(--text-caption-size);
  color: var(--text-secondary);
  margin: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.error-msg {
  color: var(--semantic-error);
  font-size: var(--text-body-sm-size);
  text-align: center;
  margin-top: var(--space-4);
}

.link-footer {
  margin-top: var(--space-8);
  text-align: center;
}
</style>
