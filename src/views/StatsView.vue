<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import { autoLevelFromScore } from '@/data/listen-bank'

const auth = useAuthStore()

// Definisi badge — dievaluasi per orang, jadi tidak ada perbandingan "menang/kalah".
const BADGES = [
  { key: 'streak3', icon: '🔥', title: 'Mulai Panas', test: (p) => (p.streak || 0) >= 3 },
  { key: 'streak7', icon: '🌋', title: 'Seminggu Beruntun', test: (p) => (p.streak || 0) >= 7 },
  { key: 'streak30', icon: '💎', title: 'Sebulan Konsisten', test: (p) => (p.streak || 0) >= 30 },
  { key: 'listen50', icon: '🎧', title: 'Telinga Tajam', test: (p) => (p.listenCorrect || 0) >= 50 },
  { key: 'listen200', icon: '👂', title: 'Master Dengar', test: (p) => (p.listenCorrect || 0) >= 200 },
  { key: 'duel3', icon: '⚔️', title: 'Petarung Kata', test: (p) => (p.duelWins || 0) >= 3 },
  { key: 'solo3', icon: '🧩', title: 'Solois Wordle', test: (p) => (p.soloWordleWins || 0) >= 3 },
  { key: 'battle3', icon: '🏁', title: 'Juara Balapan', test: (p) => (p.listenBattleWins || 0) >= 3 },
  { key: 'levelC1', icon: '🎓', title: 'Level C1+', test: (p) => ['C1', 'C2'].includes(autoLevelFromScore(p.score)) },
]

function getPlayerCardData(userData) {
  if (!userData) return null
  const p = userData || {}
  const badges = BADGES.filter((b) => b.test(p))
  return { name: p.displayName?.split(' ')[0] || 'Unknown', p, badges }
}

const cards = computed(() => {
  const list = []
  if (auth.userData) list.push(getPlayerCardData(auth.userData))
  if (auth.partnerData) list.push(getPlayerCardData(auth.partnerData))
  return list
})

const together = computed(() => {
  const a = auth.userData || {}
  const b = auth.partnerData || {}
  return {
    combinedStreak: (a.streak || 0) + (b.streak || 0),
    totalListenCorrect: (a.listenCorrect || 0) + (b.listenCorrect || 0),
    totalDuels: (a.duelWins || 0) + (b.duelWins || 0),
  }
})

function levelLabel(score) {
  return Math.floor((score || 0) / 100) + 1
}
</script>

<template>
  <div class="text-center mb-6">
    <span class="eyebrow">🏆 Rekor & Pencapaian</span>
    <h1 class="text-3xl">Progres Kalian Berdua</h1>
    <p class="text-sm mt-2" style="color:#B9C2C2">Bukan lomba — ini rekor pribadi & momen yang udah kalian capai bareng.</p>
  </div>

  <!-- Bareng-bareng -->
  <div class="card mb-4 together-card">
    <h3 class="text-lg mb-3 text-center">✨ Dicapai Bareng</h3>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <div class="text-2xl">🔥</div>
        <div class="font-mono text-xl font-semibold">{{ together.combinedStreak }}</div>
        <div class="text-[10px] uppercase" style="color:#8a8578">total hari streak</div>
      </div>
      <div>
        <div class="text-2xl">🎧</div>
        <div class="font-mono text-xl font-semibold">{{ together.totalListenCorrect }}</div>
        <div class="text-[10px] uppercase" style="color:#8a8578">jawaban dengar benar</div>
      </div>
      <div>
        <div class="text-2xl">⚔️</div>
        <div class="font-mono text-xl font-semibold">{{ together.totalDuels }}</div>
        <div class="text-[10px] uppercase" style="color:#8a8578">duel dimainkan</div>
      </div>
    </div>
  </div>

  <!-- Kartu per orang -->
  <div class="flex flex-col gap-4">
    <div v-for="c in cards" :key="c.name" class="card player-card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg" :style="{ color: c.name === 'Surya' ? 'var(--color-surya)' : 'var(--color-almira)' }">
          {{ c.name }}{{ c.name === me ? ' (kamu)' : '' }}
        </h3>
        <span class="pill" style="background: var(--color-gold); color: var(--color-ink)">{{ autoLevelFromScore(c.p.score) }}</span>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>🔥 Streak: <strong>{{ c.p.streak || 0 }}</strong></div>
        <div>⭐ Skor: <strong>{{ c.p.score || 0 }}</strong> (Lv.{{ levelLabel(c.p.score) }})</div>
        <div>⚔️ Menang duel: <strong>{{ c.p.duelWins || 0 }}</strong></div>
        <div>🏁 Menang balapan: <strong>{{ c.p.listenBattleWins || 0 }}</strong></div>
      </div>

      <div v-if="c.badges.length" class="badge-row">
        <span v-for="b in c.badges" :key="b.key" class="badge" :title="b.title">
          {{ b.icon }} <span class="text-[10px]">{{ b.title }}</span>
        </span>
      </div>
      <p v-else class="text-xs" style="color:#8a8578">Belum ada badge — ayo main lagi! 🌱</p>
    </div>
  </div>

  <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-4 underline" style="color: #9aa4a4" @click="sfx.click()">
    Kembali ke beranda
  </router-link>
</template>

<style scoped>
.together-card { background: linear-gradient(135deg, var(--color-paper), var(--color-paper-dim)); }
.badge-row { display: flex; flex-wrap: wrap; gap: 8px; }
.badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--color-paper-dim);
  font-size: 18px;
  animation: badgePop 0.4s cubic-bezier(.2,.9,.3,1.3) backwards;
}
@keyframes badgePop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
.player-card { animation: cardIn 0.35s cubic-bezier(.2,.9,.3,1.2); }
</style>
