<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { echoWordsUpToLevel } from '@/data/echo-bank'
import { sfx, speak } from '@/lib/sound'

const router = useRouter()
const auth = useAuthStore()
const playerStore = usePlayerStore(); const me = auth.currentUser?.uid; const other = auth.userData?.partnerUid; const myName = auth.userData?.displayName?.split(' ')[0] || 'Kamu'; const otherName = auth.partnerData?.displayName?.split(' ')[0] || 'Pasangan'
const myLevel = computed(() => auth.userData?.cefrLevel || 'B1')

const ROUND_SIZE = 8
const phase = ref('intro') // intro | playing | reveal | finished
const pool = ref([])
const qi = ref(0)
const input = ref('')
const score = ref(0)
const streak = ref(0)
const lastResult = ref(null) // 'correct' | 'close' | 'wrong'
const playsUsed = ref(0)

const current = computed(() => pool.value[qi.value])
const progressPct = computed(() => Math.round((qi.value / ROUND_SIZE) * 100))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function start() {
  sfx.click()
  const words = shuffle(echoWordsUpToLevel(myLevel.value))
  pool.value = words.slice(0, ROUND_SIZE)
  qi.value = 0
  score.value = 0
  streak.value = 0
  phase.value = 'playing'
  playsUsed.value = 0
  playCurrent()
}

function playCurrent() {
  sfx.click()
  playsUsed.value += 1
  speak(current.value.word)
}

function onType() {
  sfx.tick()
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

function submit() {
  if (!input.value.trim()) return
  const guess = input.value.trim().toLowerCase()
  const answer = current.value.word.toLowerCase()
  const dist = levenshtein(guess, answer)

  if (dist === 0) {
    lastResult.value = 'correct'
    const bonus = playsUsed.value === 1 ? 15 : 10
    score.value += bonus
    streak.value += 1
    streak.value % 3 === 0 ? sfx.combo() : sfx.correct()
  } else if (dist <= 2) {
    lastResult.value = 'close'
    score.value += 4
    streak.value = 0
    sfx.tick()
  } else {
    lastResult.value = 'wrong'
    streak.value = 0
    sfx.wrong()
  }
  phase.value = 'reveal'
}

function next() {
  input.value = ''
  lastResult.value = null
  playsUsed.value = 0
  if (qi.value + 1 >= pool.value.length) {
    finish()
  } else {
    qi.value += 1
    phase.value = 'playing'
    playCurrent()
  }
}

async function finish() {
  phase.value = 'finished'
  score.value >= pool.value.length * 8 ? sfx.win() : sfx.lose()
  await playerStore.recordActivity({
    score: (auth.userData?.score || 0) + score.value,
  })
}
</script>

<template>
  <div class="text-center mb-5">
    <span class="eyebrow">🎧 Echo Type</span>
    <h1 class="text-3xl">Dengar, lalu ketik</h1>
  </div>

  <div v-if="phase === 'intro'" class="card text-center py-8">
    <p class="text-[#6b675c] mb-1">Aku akan mengucapkan kata Inggris pakai suara asli.</p>
    <p class="text-[#6b675c] mb-6">Dengarkan baik-baik, lalu ketik kata yang kamu dengar!</p>
    <p class="text-xs mb-6" style="color:#8a8578">Soal disesuaikan sekitar level <strong>{{ myLevel }}</strong> kamu.</p>
    <button class="btn btn-primary" @click="start">🔊 Mulai Dengarkan</button>
    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-4 underline" style="color:#9aa4a4">Batal</router-link>
  </div>

  <div v-else-if="phase === 'finished'" class="card text-center py-8">
    <div class="text-4xl mb-2">{{ score >= pool.length * 8 ? '🏆' : '🎧' }}</div>
    <h2 class="text-2xl">Selesai!</h2>
    <p class="my-2.5 text-[#6b675c]">Skor kamu: <strong>{{ score }}</strong></p>
    <div class="flex gap-3 mt-4">
      <router-link :to="{ name: 'dashboard' }" class="btn btn-outline flex-1 text-center">Beranda</router-link>
      <button class="btn btn-primary flex-1" @click="start">Main Lagi</button>
    </div>
  </div>

  <div v-else>
    <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
      <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: progressPct + '%' }" />
    </div>

    <div class="card text-center">
      <div class="flex justify-center items-center gap-3 mb-1">
        <span class="pill">Soal {{ qi + 1 }}/{{ pool.length }}</span>
        <span class="pill" style="color: var(--color-gold)">Skor {{ score }}</span>
        <span v-if="streak > 1" class="pill glow-gold">🔥 x{{ streak }}</span>
      </div>

      <div class="speaker-wrap my-6">
        <button class="speaker-btn" @click="playCurrent" title="Putar lagi">
          🔊
        </button>
        <p class="text-xs mt-2" style="color:#8a8578">Tap untuk dengar ulang ({{ playsUsed }}x diputar)</p>
      </div>

      <template v-if="phase === 'playing'">
        <input
          v-model="input"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          placeholder="Ketik kata yang kamu dengar..."
          class="w-full border-[1.5px] rounded-xl px-4 py-3 mb-3 text-center font-mono tracking-wide outline-none focus:border-[var(--color-ink)]"
          style="border-color: var(--color-paper-dim)"
          @keyup.enter="submit"
          @keydown="onType"
        />
        <button class="btn btn-primary w-full" @click="submit">Cek Jawaban</button>
      </template>

      <template v-else>
        <div class="result-box" :class="lastResult">
          <div class="text-2xl mb-1">{{ lastResult === 'correct' ? '✅' : lastResult === 'close' ? '🤏' : '❌' }}</div>
          <p class="font-mono text-lg mb-1">{{ current.word }}</p>
          <p class="text-sm mb-1" style="color:#6b675c">{{ current.meaning }}</p>
          <p class="text-xs" style="color:#8a8578">Jawabanmu: "{{ input }}"</p>
        </div>
        <button class="btn btn-primary w-full mt-4" @click="next">Lanjut →</button>
      </template>
    </div>

    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color:#9aa4a4">Keluar</router-link>
  </div>
</template>

<style scoped>
.speaker-btn {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: none;
  font-size: 32px;
  cursor: pointer;
  background: radial-gradient(circle at 30% 30%, var(--color-gold), var(--color-gold-dim));
  box-shadow: 0 8px 24px rgba(232, 185, 68, 0.4);
  animation: speakerPulse 1.8s ease-in-out infinite;
}
@keyframes speakerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
.result-box {
  border-radius: 14px;
  padding: 18px;
  background: var(--color-paper-dim);
}
.result-box.correct { background: rgba(127, 183, 126, 0.25); }
.result-box.close { background: rgba(232, 185, 68, 0.25); }
.result-box.wrong { background: rgba(217, 112, 95, 0.2); }
</style>
