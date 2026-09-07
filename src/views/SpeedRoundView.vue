<script setup>
import { ref, computed, onUnmounted, watch as vueWatch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { sfx } from '@/lib/sound'
import { useCoopSession } from '@/lib/coop'

const router = useRouter()
const auth = useAuthStore()
const playerStore = usePlayerStore(); const me = auth.currentUser?.uid; const other = auth.userData?.partnerUid; const myName = auth.userData?.displayName?.split(' ')[0] || 'Kamu'; const otherName = auth.partnerData?.displayName?.split(' ')[0] || 'Pasangan'
// other and names defined above

const ROUND_SECONDS = 60

// mode: null | 'solo' | 'coop'
const mode = ref(null)
const coop = useCoopSession('speed')

function shuffledPool() {
  const arr = [...QUIZ_BANK, ...QUIZ_BANK]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/* ---------------- Solo ---------------- */
const phase = ref('intro') // intro | playing | finished
const timeLeft = ref(ROUND_SECONDS)
const score = ref(0)
const combo = ref(0)
const bestCombo = ref(0)
const pool = ref([])
const qi = ref(0)
const answered = ref(false)
const flash = ref('')
let timer = null

const multiplier = computed(() => Math.min(1 + Math.floor(combo.value / 3), 5))
const current = computed(() => pool.value[qi.value])
const timePct = computed(() => (timeLeft.value / ROUND_SECONDS) * 100)

function start() {
  sfx.click()
  pool.value = shuffledPool()
  qi.value = 0
  score.value = 0
  combo.value = 0
  bestCombo.value = 0
  timeLeft.value = ROUND_SECONDS
  phase.value = 'playing'
  timer = setInterval(() => {
    timeLeft.value -= 1
    timeLeft.value <= 10 ? sfx.tickUrgent() : sfx.tick()
    if (timeLeft.value <= 0) endRound()
  }, 1000)
}

async function endRound() {
  clearInterval(timer)
  phase.value = 'finished'
  score.value > 0 ? sfx.win() : sfx.lose()
  const prevBest = auth.userData?.speedHighScore || 0
  await playerStore.recordActivity({
    speedHighScore: Math.max(prevBest, score.value),
    score: (auth.userData?.score || 0) + score.value,
  })
}

function answer(i) {
  if (answered.value || phase.value !== 'playing') return
  answered.value = true
  const correct = i === current.value.a
  if (correct) {
    combo.value += 1
    bestCombo.value = Math.max(bestCombo.value, combo.value)
    score.value += 10 * multiplier.value
    flash.value = 'good'
    combo.value % 3 === 0 ? sfx.combo() : sfx.correct()
  } else {
    combo.value = 0
    flash.value = 'bad'
    sfx.wrong()
  }
  setTimeout(() => {
    flash.value = ''
    answered.value = false
    qi.value = (qi.value + 1) % pool.value.length
  }, 350)
}

/* ---------------- Coop (race bareng, skor & waktu digabung) ---------------- */
const coopAnswered = ref(false)
const coopFlash = ref('')
let coopTimer = null

const isHost = computed(() => coop.session.value?.hostId === me)
const coopCurrent = computed(() => coop.session.value?.pool?.[coop.session.value.qi])
const coopMultiplier = computed(() => Math.min(1 + Math.floor((coop.session.value?.combo || 0) / 3), 5))
const coopTimePct = computed(() => ((coop.session.value?.timeLeft ?? ROUND_SECONDS) / ROUND_SECONDS) * 100)

async function startCoop() {
  sfx.click()
  await coop.createSession({
    pool: shuffledPool(),
    qi: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: ROUND_SECONDS,
    status: 'playing',
    hostId: me,
  })
}

async function rematchCoop() {
  sfx.click()
  stopCoopTimer()
  await coop.endSession()
}

function stopCoopTimer() {
  if (coopTimer) {
    clearInterval(coopTimer)
    coopTimer = null
  }
}

// Cuma yang memulai sesi ("host") yang menjalankan jam sungguhan — dikirim ke
// Firestore tiap detik supaya kedua HP menampilkan hitung mundur yang sama persis.
function runHostTimer() {
  stopCoopTimer()
  coopTimer = setInterval(async () => {
    if (!coop.session.value || coop.session.value.status !== 'playing') return stopCoopTimer()
    const t = coop.session.value.timeLeft - 1
    t <= 10 ? sfx.tickUrgent() : sfx.tick()
    if (t <= 0) {
      stopCoopTimer()
      sfx.lose()
      await coop.patchSession({ timeLeft: 0, status: 'finished' })
      await playerStore.recordActivity({ score: (auth.userData?.score || 0) + Math.floor((coop.session.value.score || 0) / 2) })
    } else {
      await coop.patchSession({ timeLeft: t })
    }
  }, 1000)
}

async function coopAnswer(i) {
  if (coopAnswered.value || !coop.session.value || coop.session.value.status !== 'playing') return
  coopAnswered.value = true
  const sess = coop.session.value
  const qBefore = sess.qi
  const correct = i === coopCurrent.value.a
  const newCombo = correct ? (sess.combo || 0) + 1 : 0
  coopFlash.value = correct ? 'good' : 'bad'
  correct ? (newCombo % 3 === 0 ? sfx.combo() : sfx.correct()) : sfx.wrong()

  setTimeout(async () => {
    coopFlash.value = ''
    coopAnswered.value = false
    // Guard sederhana: kalau soal sudah berpindah duluan (pasangan lebih cepat jawab), jangan dobel-hitung.
    if (!coop.session.value || coop.session.value.qi !== qBefore || coop.session.value.status !== 'playing') return
    await coop.patchSession({
      qi: (qBefore + 1) % sess.pool.length,
      combo: newCombo,
      bestCombo: Math.max(sess.bestCombo || 0, newCombo),
      score: (sess.score || 0) + (correct ? 10 * Math.min(1 + Math.floor(newCombo / 3), 5) : 0),
    })
  }, 350)
}

function chooseMode(m) {
  sfx.click()
  mode.value = m
  if (m === 'coop') coop.watch()
}
function backToModeSelect() {
  sfx.click()
  stopCoopTimer()
  mode.value = null
}

vueWatch(
  () => [coop.session.value?.status, coop.session.value?.hostId],
  () => {
    if (mode.value === 'coop' && coop.session.value?.status === 'playing' && isHost.value && !coopTimer) {
      runHostTimer()
    }
    if (coop.session.value?.status !== 'playing') stopCoopTimer()
  },
)

onUnmounted(() => {
  clearInterval(timer)
  stopCoopTimer()
})
</script>

<template>
  <!-- Mode picker -->
  <div v-if="!mode" class="text-center">
    <div class="mb-5">
      <span class="eyebrow">⚡ Speed Round</span>
      <h1 class="text-3xl">Pilih Mode</h1>
    </div>
    <div class="card text-center">
      <p class="mb-4 text-[#6b675c]">Main sendiri lawan waktu, atau balapan bareng {{ otherName }} jawab soal yang sama (skor digabung)?</p>
      <div class="flex gap-3">
        <button class="btn btn-primary flex-1 py-5" @click="chooseMode('solo')">🧍 Solo<br /><span class="text-xs font-normal opacity-80">Lawan waktu</span></button>
        <button class="btn btn-outline flex-1 py-5" @click="chooseMode('coop')">🤝 Bareng<br /><span class="text-xs font-normal opacity-80">Balapan sama {{ otherName }}</span></button>
      </div>
    </div>
    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color: #9aa4a4" @click="sfx.click()">Kembali ke beranda</router-link>
  </div>

  <!-- ===== SOLO ===== -->
  <template v-else-if="mode === 'solo'">
    <div v-if="phase === 'intro'" class="card text-center py-10">
      <div class="text-4xl mb-2">⚡</div>
      <h2 class="text-2xl mb-2">Speed Round Solo</h2>
      <p class="text-[#6b675c] mb-1">60 detik, jawab sebanyak mungkin.</p>
      <p class="text-[#6b675c] mb-6">3 jawaban benar beruntun = combo naik, poin makin gede!</p>
      <button class="btn btn-primary" @click="start">Mulai!</button>
      <a class="block text-center text-sm mt-4 underline cursor-pointer" style="color: #9aa4a4" @click="backToModeSelect">← Ganti mode</a>
    </div>

    <div v-else-if="phase === 'playing'" :class="'flash-' + flash">
      <div class="flex justify-between items-center mb-2 font-mono text-sm">
        <span>⏱ {{ timeLeft }}s</span>
        <span>Skor: {{ score }}</span>
        <span style="color: var(--color-gold)">Combo x{{ multiplier }}</span>
      </div>
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
        <div class="h-full transition-all" :style="{ width: timePct + '%', background: timePct < 25 ? 'var(--color-bad)' : 'var(--color-gold)' }" />
      </div>
      <div class="card">
        <span class="qtag">{{ current.tag }}</span>
        <div class="text-xl font-medium mb-5 leading-snug">{{ current.q }}</div>
        <button v-for="(opt, i) in current.opts" :key="i" class="opt" @click="answer(i)">{{ opt }}</button>
      </div>
    </div>

    <div v-else class="card text-center py-10">
      <div class="text-4xl mb-2">🏁</div>
      <h2 class="text-2xl">Waktu habis!</h2>
      <p class="my-2.5 text-[#6b675c]">Skor: <strong>{{ score }}</strong> · Combo terbaik: <strong>x{{ Math.min(1 + Math.floor(bestCombo / 3), 5) }}</strong></p>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
        <button class="btn btn-primary flex-1" @click="start">Main Lagi</button>
      </div>
    </div>
  </template>

  <!-- ===== COOP ===== -->
  <template v-else>
    <div v-if="!coop.session.value" class="card text-center">
      <p class="mb-4 text-[#6b675c]">Belum ada sesi jalan. Mulai, nanti {{ otherName }} bisa langsung gabung dari HP-nya.</p>
      <button class="btn btn-primary w-full" @click="startCoop">Mulai Sesi Bareng</button>
      <a class="block text-center text-sm mt-4 underline cursor-pointer" style="color: #9aa4a4" @click="backToModeSelect">← Ganti mode</a>
    </div>

    <div v-else-if="coop.session.value.status === 'finished'" class="card text-center py-10">
      <div class="text-4xl mb-2">🏁</div>
      <h2 class="text-2xl">Waktu habis!</h2>
      <p class="my-2.5 text-[#6b675c]">
        Skor kalian berdua: <strong>{{ coop.session.value.score }}</strong> · Combo terbaik:
        <strong>x{{ Math.min(1 + Math.floor((coop.session.value.bestCombo || 0) / 3), 5) }}</strong>
      </p>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
        <button class="btn btn-primary flex-1" @click="rematchCoop">Main Lagi</button>
      </div>
    </div>

    <div v-else :class="'flash-' + coopFlash">
      <div class="flex justify-between items-center mb-2 font-mono text-sm">
        <span>⏱ {{ coop.session.value.timeLeft }}s</span>
        <span>Skor bareng: {{ coop.session.value.score }}</span>
        <span style="color: var(--color-gold)">Combo x{{ coopMultiplier }}</span>
      </div>
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
        <div class="h-full transition-all" :style="{ width: coopTimePct + '%', background: coopTimePct < 25 ? 'var(--color-bad)' : 'var(--color-gold)' }" />
      </div>
      <p class="text-center text-xs mb-3" style="color:#8a8578">Siapa cepat jawab benar, itu yang dapet poinnya — bareng-bareng kejar skor tinggi!</p>
      <div class="card">
        <span class="qtag">{{ coopCurrent.tag }}</span>
        <div class="text-xl font-medium mb-5 leading-snug">{{ coopCurrent.q }}</div>
        <button v-for="(opt, i) in coopCurrent.opts" :key="i" class="opt" @click="coopAnswer(i)">{{ opt }}</button>
      </div>
      <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color: #9aa4a4" @click="sfx.click()">Keluar</router-link>
    </div>
  </template>
</template>

<style scoped>
.qtag {
  display: inline-block; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
  background: var(--color-paper-dim); color: var(--color-ink-soft); margin-bottom: 12px;
}
.opt {
  display: block; width: 100%; text-align: left; background: #fff; border: 1.5px solid var(--color-paper-dim);
  border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; font-size: 15px; color: var(--color-ink);
}
.opt:hover { border-color: var(--color-ink); }
.flash-good { animation: flashGood 0.35s ease; }
.flash-bad { animation: flashBad 0.35s ease; }
@keyframes flashGood { 0% { filter: brightness(1.3); } }
@keyframes flashBad { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
</style>
