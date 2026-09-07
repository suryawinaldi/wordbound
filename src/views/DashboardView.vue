<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import { autoLevelFromScore } from '@/data/listen-bank'
import AppShell from '@/layouts/AppShell.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import NavigationShell from '@/components/shared/NavigationShell.vue'
import Avatar from '@/components/base/Avatar.vue'
import Badge from '@/components/base/Badge.vue'
import Button from '@/components/base/Button.vue'

const auth = useAuthStore()
const router = useRouter()

const meData = computed(() => auth.userData || {})
const otherData = computed(() => auth.partnerData || {})
const me = computed(() => meData.value.displayName?.split(' ')[0] || 'Kamu')
const other = computed(() => otherData.value.displayName?.split(' ')[0] || 'Pasangan')

// Data kedua pemain sudah di-watch secara global sejak login (lihat stores/auth.js),
// jadi tetap live walau pindah-pindah halaman — tidak perlu di-refresh manual.

function levelLabel(score) {
  return `Lv. ${Math.floor((score || 0) / 100) + 1}`
}
function xpPct(score) {
  return (score || 0) % 100
}

async function switchProfile() {
  sfx.click()
  await auth.logout()
  router.push({ name: 'splash' })
}

function menuClick() {
  sfx.click()
}

const menu = computed(() => [
  { to: 'listen', icon: '🎧', title: 'Dengar & Tulis', desc: 'Solo atau balapan bareng — dengar kata/kalimat, lalu ketik atau pilih ganda' },
  { to: 'duel', icon: '⚔️', title: 'Wordle', desc: `Solo, atau duel lawan ${other.value}` },
])

// NavigationShell items point only at routes that actually exist today
// (see router/index.js) — no placeholder destinations for pages not
// built yet (Games Hub, Garden, Couple, etc. are later milestones).
const navItems = computed(() => [
  { label: 'Beranda', to: { name: 'dashboard' } },
  { label: 'Dengar', to: { name: 'listen' } },
  { label: 'Wordle', to: { name: 'duel' } },
  { label: 'Rekor', to: { name: 'stats' } },
  { label: 'Profil', to: { name: 'profile' } },
])
</script>

<template>
  <AppShell>
    <template #navigation>
      <NavigationShell :items="navItems">
        <template #player>
          <div class="dashboard-nav-player" @click="router.push('/profile')">
            <Avatar :src="meData.photoURL" :initials="me?.[0]" :alt="me" size="sm" :variant="meData.streak > 0 ? 'online' : 'default'" />
            <span class="dashboard-nav-player__name">{{ me }}</span>
          </div>
        </template>
      </NavigationShell>
    </template>

    <DashboardLayout>
      <template #primary>
        <!-- Header -->
        <div class="dashboard-header">
          <span class="dashboard-eyebrow">Halo, {{ me }} 👋</span>
          <h1 class="dashboard-title">Siap belajar hari ini?</h1>
        </div>

        <!-- Optional Partner Connection Card -->
        <div v-if="!auth.userData?.partnerUid" class="partner-card" @click="router.push('/couple-link')">
          <div class="partner-card-content">
            <h3 class="partner-card-title">Cari Pasangan Belajar 👩‍❤️‍👨</h3>
            <p class="partner-card-desc">Hubungkan akunmu dengan pacar atau teman agar belajar jadi lebih seru!</p>
          </div>
          <Button variant="primary" class="partner-btn">Hubungkan</Button>
        </div>

        <!-- Continue Learning (Hero Card) -->
        <div class="hero-card" @click="menuClick(); router.push('/listen')">
          <div class="hero-card-bg">🎧</div>
          <div class="hero-card-content">
            <span class="hero-card-badge">Lanjutkan Belajar</span>
            <h2 class="hero-card-title">Dengar & Tulis</h2>
            <p class="hero-card-desc">Pertajam pendengaranmu. Dengar kata atau kalimat, lalu ketik jawabannya.</p>
            <Button class="hero-card-btn">Mulai Main</Button>
          </div>
        </div>

        <!-- Games Grid -->
        <h3 class="games-header">Semua Permainan</h3>
        <div class="games-grid">
          <div 
            v-for="item in menu" 
            :key="item.to"
            @click="menuClick(); router.push('/' + item.to)"
            class="game-card"
          >
            <div class="game-card-icon">{{ item.icon }}</div>
            <h4 class="game-card-title">{{ item.title }}</h4>
            <p class="game-card-desc">{{ item.desc }}</p>
          </div>
        </div>
      </template>

      <template #secondary>
        <!-- Stats Sidebar -->
        <div class="stats-sidebar">
          <h3 class="stats-header">Pencapaian</h3>
          
          <div class="stats-list">
            <!-- My Stats -->
            <div class="stat-row">
              <Avatar :src="meData.photoURL" :initials="me?.[0]" :alt="me" size="md" :variant="meData.streak > 0 ? 'online' : 'default'" />
              <div class="stat-info">
                <p class="stat-name">{{ me }} (Kamu)</p>
                <div class="stat-badges">
                  <span class="stat-streak">🔥 {{ meData.streak || 0 }} hari</span>
                  <span class="stat-xp">✨ {{ meData.xp || 0 }} XP</span>
                </div>
              </div>
              <Badge variant="primary">{{ autoLevelFromScore(meData.score) || 'A1' }}</Badge>
            </div>

            <!-- Partner Stats -->
            <div v-if="auth.userData?.partnerUid" class="stat-row">
              <Avatar :src="otherData.photoURL" :initials="other?.[0]" :alt="other" size="md" :variant="otherData.streak > 0 ? 'online' : 'default'" />
              <div class="stat-info">
                <p class="stat-name">{{ other }}</p>
                <div class="stat-badges">
                  <span class="stat-streak">🔥 {{ otherData.streak || 0 }} hari</span>
                  <span class="stat-xp">✨ {{ otherData.xp || 0 }} XP</span>
                </div>
              </div>
              <Badge variant="default">{{ autoLevelFromScore(otherData.score) || 'A1' }}</Badge>
            </div>
            
            <div v-else class="empty-partner">
              <p class="empty-partner-desc">Belum ada teman bersaing.</p>
              <Button variant="ghost" @click="router.push('/couple-link')">Undang Pasangan</Button>
            </div>
          </div>
          
          <hr class="stats-divider" />
          
          <Button variant="secondary" block class="stats-full-btn" @click="router.push('/stats')">
            🏅 Lihat Rekor Lengkap
          </Button>
        </div>
      </template>
    </DashboardLayout>
  </AppShell>
</template>

<style scoped>
.dashboard-nav-player {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast);
}
.dashboard-nav-player:hover {
  background-color: var(--bg-subtle);
}
.dashboard-nav-player__name {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

.dashboard-eyebrow {
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--text-caption-tracking);
  text-transform: var(--text-caption-transform);
  color: var(--brand-primary);
}

.dashboard-title {
  font-family: var(--text-display-lg-family);
  font-size: var(--text-display-lg-size);
  line-height: var(--text-display-lg-leading);
  font-weight: var(--text-display-lg-weight);
  color: var(--text-primary);
  margin: 0;
}

.partner-card {
  background-color: var(--color-amber-50, #FFFBEB);
  border: 2px solid var(--color-amber-200, #FDE68A);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  cursor: pointer;
  transition: transform var(--duration-fast);
}

@media (min-width: 640px) {
  .partner-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.partner-card:hover {
  transform: translateY(-2px);
}

.partner-card-title {
  font-family: var(--text-heading-md-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--text-heading-md-weight);
  color: var(--color-amber-900, #78350F);
  margin: 0 0 var(--space-1);
}

.partner-card-desc {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  color: var(--color-amber-800, #92400E);
  margin: 0;
}

.partner-btn {
  background-color: var(--color-amber-500);
  border-color: var(--color-amber-500);
  color: white;
  flex-shrink: 0;
  white-space: nowrap;
}

.hero-card {
  position: relative;
  background: linear-gradient(135deg, var(--color-green-500), var(--color-green-700));
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-8);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--duration-fast), box-shadow var(--duration-fast);
}

.hero-card:hover {
  transform: scale(1.01);
  box-shadow: var(--shadow-lg);
}

.hero-card-bg {
  position: absolute;
  right: -1rem;
  top: -1rem;
  opacity: 0.2;
  font-size: 8rem;
  pointer-events: none;
}

.hero-card-content {
  position: relative;
  z-index: 10;
}

.hero-card-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--text-caption-tracking);
  margin-bottom: var(--space-4);
  backdrop-filter: blur(4px);
}

.hero-card-title {
  font-family: var(--text-heading-lg-family);
  font-size: var(--text-heading-lg-size);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2);
}

.hero-card-desc {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  color: var(--color-green-50, #F0FDF4);
  max-width: 24rem;
  margin: 0 0 var(--space-6);
}

.hero-card-btn {
  background-color: var(--color-white);
  color: var(--color-green-700);
  border: none;
  font-weight: var(--font-weight-bold);
}

.games-header {
  font-family: var(--text-heading-lg-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4);
}

.games-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 640px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.game-card {
  background-color: var(--surface-card);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform var(--duration-fast), border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.game-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-green-500);
  box-shadow: var(--shadow-md);
}

.game-card-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-3);
}

.game-card-title {
  font-family: var(--text-heading-md-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}

.game-card-desc {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
  margin: 0;
  flex-grow: 1;
}

.stats-sidebar {
  background-color: var(--surface-card);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: var(--space-6);
}

.stats-header {
  font-family: var(--text-heading-md-family);
  font-size: var(--text-heading-md-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  background-color: var(--bg-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.stat-info {
  flex-grow: 1;
}

.stat-name {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.stat-badges {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.stat-streak, .stat-xp {
  font-family: var(--font-mono);
  font-size: var(--text-caption-size);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-streak {
  color: var(--color-amber-500);
}

.stat-xp {
  color: var(--color-green-700);
}

.empty-partner {
  text-align: center;
  padding: var(--space-4);
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
}

.empty-partner-desc {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  color: var(--text-secondary);
  margin: 0 0 var(--space-2);
}

.stats-divider {
  border: 0;
  border-top: 1px solid var(--border-default);
  margin: var(--space-6) 0;
}

.stats-full-btn {
  font-weight: var(--font-weight-bold);
}
</style>
