<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import AppShell from '@/layouts/AppShell.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import NavigationShell from '@/components/shared/NavigationShell.vue'
import Avatar from '@/components/base/Avatar.vue'
import Button from '@/components/base/Button.vue'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const auth = useAuthStore()
const settings = useSettingsStore()

const myName = computed(() => auth.userData?.displayName || 'Unknown')
const myPhoto = computed(() => auth.currentUser?.photoURL)
const myEmail = computed(() => auth.currentUser?.email)
const partnerName = computed(() => auth.partnerData?.displayName || 'Belum Terhubung')

const navItems = computed(() => [
  { label: 'Beranda', to: { name: 'dashboard' } },
  { label: 'Dengar', to: { name: 'listen' } },
  { label: 'Wordle', to: { name: 'duel' } },
  { label: 'Rekor', to: { name: 'stats' } },
  { label: 'Profil', to: { name: 'profile' } },
])

async function handleLogout() {
  sfx.click()
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <AppShell>
    <template #navigation>
      <NavigationShell :items="navItems">
        <template #player>
          <div class="flex items-center gap-2">
            <Avatar :src="myPhoto" :initials="myName[0]" size="sm" variant="online" />
            <span class="text-sm font-medium">{{ myName.split(' ')[0] }}</span>
          </div>
        </template>
      </NavigationShell>
    </template>

    <DashboardLayout>
      <template #primary>
        <div class="text-center mb-6">
          <span class="eyebrow">Profil & Pengaturan</span>
          <h1 class="text-3xl">Akun Kamu</h1>
        </div>

        <div class="card flex flex-col items-center gap-4 mb-6 p-6">
          <Avatar :src="myPhoto" :initials="myName[0]" size="xl" />
          <div class="text-center">
            <h2 class="text-xl font-semibold">{{ myName }}</h2>
            <p class="text-sm text-secondary">{{ myEmail }}</p>
          </div>
        </div>

        <div class="card mb-6">
          <h3 class="text-lg font-semibold mb-2">Pasangan</h3>
          <p class="text-sm text-secondary mb-4">Terhubung dengan: <strong>{{ partnerName }}</strong></p>
          <Button v-if="!auth.userData?.partnerUid" variant="primary" block @click="router.push('/couple-link')">
            Hubungkan Pasangan
          </Button>
        </div>

        <div class="card mb-6">
          <h3 class="text-lg font-semibold mb-4">Pengaturan</h3>
          
          <div class="flex items-center justify-between py-3 border-b border-subtle">
            <div>
              <p class="font-medium">Tema Gelap</p>
              <p class="text-xs text-secondary">Ubah tampilan aplikasi</p>
            </div>
            <select 
              :value="settings.theme"
              @change="e => settings.setTheme(e.target.value)"
              class="px-3 py-1 rounded bg-subtle border border-default text-sm"
            >
              <option value="system">Otomatis</option>
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
          </div>

          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium">Efek Suara</p>
              <p class="text-xs text-secondary">Suara tombol dan jawaban</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                class="sr-only peer" 
                :checked="settings.soundEnabled"
                @change="e => settings.setSoundEnabled(e.target.checked)"
              >
              <div class="w-11 h-6 bg-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <Button variant="ghost" block @click="handleLogout" class="text-error">
          Keluar dari Akun
        </Button>
      </template>

      <template #secondary></template>
    </DashboardLayout>
  </AppShell>
</template>

<style scoped>
.eyebrow {
  display: inline-block;
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--text-caption-tracking);
  color: var(--brand-primary);
  margin-bottom: var(--space-2);
}

.card {
  background-color: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.border-subtle {
  border-color: var(--border-default);
}
.bg-subtle {
  background-color: var(--bg-subtle);
}
.text-error {
  color: var(--semantic-error) !important;
}
</style>
