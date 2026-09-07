<script setup>
import { ref, computed, watch as vueWatch, onUnmounted } from 'vue'
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

const AUTO_SKIP_MS = 6500 // sekitar sama dengan durasi balon terbang sampai hilang dari layar

// mode: null (belum pilih) | 'solo' | 'coop'
const mode = ref(null)
const coop = useCoopSession('quiz')

const idx = ref(0)
const answered = ref(false)
const finished = ref(false)
const fieldRef = ref(null)
const balloonStates = ref({})
const confetti = ref([])
const toast = ref('')
let autoSkipTimer = null

// --- Solo ---
const soloQuestions = ref([])
const soloScore = ref(0)

// --- Sumber soal aktif tergantung mode ---
const current = computed(() => {
  if (mode.value === 'coop') return coop.session.value?.questions?.[coop.session.value.idx]
  return soloQuestions.value[idx.value]
})
const totalQuestions = computed(() => (mode.value === 'coop' ? coop.session.value?.questions?.length || 0 : soloQuestions.value.length))
const activeIdx = computed(() => (mode.value === 'coop' ? coop.session.value?.idx || 0 : idx.value))
const progressPct = computed(() => (totalQuestions.value ? Math.round((activeIdx.value / totalQuestions.value) * 100) : 0))
const myTurn = computed(() => mode.value !== 'coop' || coop.session.value?.turn === me)

const positions = ['6%', '32%', '58%', '80%']
const delays = ['0s', '0.9s', '0.4s', '1.3s']

function showToast(msg) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2000)
}

function spawnConfetti(x, y) {
  const colors = ['var(--color-gold)', 'var(--color-good)', 'var(--color-surya)', 'var(--color-almira)']
  for (let i = 0; i < 10; i++) {
    const id = Math.random().toString(36).slice(2)
    confetti.value.push({
      id,
      left: x + (Math.random() * 40 - 20),
      top: y + (Math.random() * 20 - 10),
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
    })
    setTimeout(() => {
      confetti.value = confetti.value.filter((c) => c.id !== id)
    }, 900)
  }
}

function clearAutoSkip() {
  if (autoSkipTimer) {
    clearTimeout(autoSkipTimer)
    autoSkipTimer = null
  }
}

// FIX: sebelumnya kalau balon dibiarkan terbang sampai habis tanpa disentuh,
// tidak ada apa pun yang lanjut ke soal berikutnya — game jadi macet total.
// Sekarang ada timer otomatis yang menganggapnya "tidak terjawab" dan lanjut sendiri.
function scheduleAutoSkip() {
  clearAutoSkip()
  autoSkipTimer = setTimeout(() => {
    if (!answered.value && myTurn.value) answer(-1)
  }, AUTO_SKIP_MS)
}

/* ---------------- Solo ---------------- */
function startSolo() {
  sfx.click()
  soloQuestions.value = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 5)
  idx.value = 0
  soloScore.value = 0
  finished.value = false
  answered.value = false
  balloonStates.value = {}
  scheduleAutoSkip()
}

/* ---------------- Coop ---------------- */
async function startCoop() {
  sfx.click()
  const questions = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 5)
  await coop.createSession({ questions, idx: 0, score: 0, turn: me, status: 'playing' })
}

async function rematchCoop() {
  sfx.click()
  await coop.endSession()
}

/* ---------------- Jawab (dipakai solo & coop) ---------------- */
async function answer(i, event) {
  if (answered.value) return
  if (mode.value === 'coop' && !myTurn.value) return
  answered.value = true
  clearAutoSkip()

  const q = current.value
  if (!q) {
    answered.value = false
    return
  }
  const timedOut = i === -1
  const correct = !timedOut && i === q.a

  if (timedOut) {
    balloonStates.value[q.a] = 'glow'
    showToast('Waktu habis, lanjut ⏰')
    sfx.wrong()
  } else if (correct) {
    sfx.correct()
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      const fieldRect = fieldRef.value.getBoundingClientRect()
      balloonStates.value[i] = 'popped'
      spawnConfetti(rect.left - fieldRect.left + rect.width / 2, rect.top - fieldRect.top + rect.height / 2)
    }
    showToast('Betul! 🎉')
  } else {
    balloonStates.value[i] = 'sunk'
    balloonStates.value[q.a] = 'glow'
    showToast('Kurang tepat, ini jawabannya ✨')
    sfx.wrong()
  }

  await new Promise((r) => setTimeout(r, 1000))

  if (mode.value === 'coop') {
    const sess = coop.session.value
    const nextIdx = sess.idx + 1
    const isFinished = nextIdx >= sess.questions.length
    await coop.patchSession({
      idx: nextIdx,
      score: (sess.score || 0) + (correct ? 1 : 0),
      turn: other,
      status: isFinished ? 'finished' : 'playing',
    })
    answered.value = false
    balloonStates.value = {}
    if (isFinished) {
      sess.score + (correct ? 1 : 0) >= sess.questions.length / 2 ? sfx.win() : sfx.lose()
    }
  } else {
    if (correct) soloScore.value += 1
    idx.value += 1
    answered.value = false
    balloonStates.value = {}
    if (idx.value >= soloQuestions.value.length) {
      finished.value = true
      soloScore.value >= soloQuestions.value.length / 2 ? sfx.win() : sfx.lose()
      await playerStore.recordActivity({
        score: (auth.userData?.score || 0) + soloScore.value,
        quizzes: (auth.userData?.quizzes || 0) + 1,
      })
    } else {
      scheduleAutoSkip()
    }
  }
}

function chooseMode(m) {
  sfx.click()
  mode.value = m
  if (m === 'coop') coop.watch()
}

function backToModeSelect() {
  sfx.click()
  clearAutoSkip()
  mode.value = null
}

// Reset tampilan tiap kali giliran/soal co-op berubah, dan mulai timer auto-skip
// hanya di sisi pemain yang sedang giliran (supaya tidak double-trigger).
vueWatch(
  () => coop.session.value?.idx,
  () => {
    if (mode.value !== 'coop') return
    answered.value = false
    balloonStates.value = {}
    if (coop.session.value?.status === 'playing' && myTurn.value) scheduleAutoSkip()
  },
)

onUnmounted(clearAutoSkip)
</script>

<template>
  <!-- Mode picker -->
  <div v-if="!mode" class="text-center">
    <div class="mb-5">
      <span class="eyebrow">🎈 Kuis Solo</span>
      <h1 class="text-3xl">Pilih Mode</h1>
    </div>
    <div class="card text-center">
      <p class="mb-4 text-[#6b675c]">Main sendiri, atau bareng {{ otherName }} gantian jawab (skor digabung, bukan lomba)?</p>
      <div class="flex gap-3">
        <button class="btn btn-primary flex-1 py-5" @click="chooseMode('solo')">
          🧍 Solo<br /><span class="text-xs font-normal opacity-80">Main sendiri</span>
        </button>
        <button class="btn btn-outline flex-1 py-5" @click="chooseMode('coop')">
          🤝 Bareng<br /><span class="text-xs font-normal opacity-80">Gantian sama {{ otherName }}</span>
        </button>
      </div>
    </div>
    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color: #9aa4a4" @click="sfx.click()">
      Kembali ke beranda
    </router-link>
  </div>

  <!-- ===== SOLO ===== -->
  <template v-else-if="mode === 'solo'">
    <div v-if="soloQuestions.length === 0" class="card text-center">
      <p class="mb-4 text-[#6b675c]">5 soal vocab & grammar — pecahin balon jawaban yang benar 🎈</p>
      <button class="btn btn-primary w-full" @click="startSolo">Mulai</button>
    </div>

    <template v-else-if="!finished">
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
        <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: progressPct + '%' }" />
      </div>
      <span class="qtag">{{ current.tag }}</span>
      <div class="text-xl font-medium mb-5 leading-snug">{{ current.q }}</div>
      <p class="text-center text-xs text-[#B9C2C2] mb-3">Pecahin balon dengan jawaban yang benar 🎈</p>

      <div ref="fieldRef" class="balloon-field">
        <div
          v-for="(opt, i) in current.opts"
          :key="idx + '-' + i"
          class="balloon"
          :class="['c' + (i % 4), balloonStates[i]]"
          :style="{ left: positions[i], animationDelay: delays[i] + ', ' + delays[i] }"
          @click="(e) => answer(i, e)"
        >
          {{ opt }}
        </div>
        <div
          v-for="c in confetti"
          :key="c.id"
          class="confetti"
          :style="{ left: c.left + 'px', top: c.top + 'px', background: c.color, borderRadius: c.round ? '50%' : '2px' }"
        />
      </div>

      <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color: #9aa4a4" @click="sfx.click()">
        Keluar dari kuis
      </router-link>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </template>

    <div v-else class="card text-center py-10">
      <div class="text-4xl mb-2">{{ soloScore >= 4 ? '🏆' : soloScore >= 2 ? '👍' : '🌱' }}</div>
      <h2 class="text-2xl">Selesai!</h2>
      <p class="my-2.5 text-[#6b675c]">Skor kamu: <strong>{{ soloScore }} / {{ soloQuestions.length }}</strong></p>
      <div class="flex gap-3 mt-2.5 justify-center">
        <button class="btn btn-outline" @click="backToModeSelect">Ganti Mode</button>
        <button class="btn btn-primary" @click="router.push({ name: 'dashboard' })">Kembali ke Beranda</button>
      </div>
    </div>
  </template>

  <!-- ===== COOP ===== -->
  <template v-else>
    <div class="text-center mb-5">
      <span class="eyebrow">🤝 Main Bareng</span>
      <h1 class="text-2xl">{{ myName }} & {{ otherName }}</h1>
    </div>

    <div v-if="!coop.session.value" class="card text-center">
      <p class="mb-4 text-[#6b675c]">Belum ada sesi jalan. Mulai, nanti {{ otherName }} bisa langsung gabung dari HP-nya.</p>
      <button class="btn btn-primary w-full" @click="startCoop">Mulai Sesi Bareng</button>
    </div>

    <template v-else-if="coop.session.value.status === 'finished'">
      <div class="card text-center py-8">
        <div class="text-4xl mb-2">{{ coop.session.value.score >= coop.session.value.questions.length / 2 ? '🏆' : '🌱' }}</div>
        <h2 class="text-2xl">Selesai!</h2>
        <p class="my-2.5 text-[#6b675c]">
          Skor kalian berdua: <strong>{{ coop.session.value.score }} / {{ coop.session.value.questions.length }}</strong>
        </p>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
          <button class="btn btn-primary flex-1" @click="rematchCoop">Main Lagi</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-3">
        <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: progressPct + '%' }" />
      </div>
      <div
        class="text-center font-mono text-xs uppercase tracking-wide py-2 rounded-lg mb-3"
        :style="myTurn ? 'background: var(--color-gold); color: var(--color-ink); font-weight:600' : 'background: var(--color-paper-dim); color: var(--color-ink-soft)'"
      >
        {{ myTurn ? 'Giliran kamu jawab' : `Giliran ${other}...` }} · Skor bareng {{ coop.session.value.score }}
      </div>
      <span class="qtag">{{ current.tag }}</span>
      <div class="text-xl font-medium mb-5 leading-snug">{{ current.q }}</div>

      <div ref="fieldRef" class="balloon-field" :class="{ 'not-my-turn': !myTurn }">
        <div
          v-for="(opt, i) in current.opts"
          :key="activeIdx + '-' + i"
          class="balloon"
          :class="['c' + (i % 4), balloonStates[i]]"
          :style="{ left: positions[i], animationDelay: delays[i] + ', ' + delays[i] }"
          @click="myTurn ? answer(i, $event) : null"
        >
          {{ opt }}
        </div>
        <div
          v-for="c in confetti"
          :key="c.id"
          class="confetti"
          :style="{ left: c.left + 'px', top: c.top + 'px', background: c.color, borderRadius: c.round ? '50%' : '2px' }"
        />
      </div>

      <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color: #9aa4a4" @click="sfx.click()">
        Keluar dari kuis
      </router-link>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </template>

    <a v-if="!coop.session.value" class="block text-center text-sm mt-3 underline cursor-pointer" style="color: #9aa4a4" @click="backToModeSelect">
      ← Ganti mode
    </a>
  </template>
</template>

<style scoped>
.qtag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--color-paper-dim);
  color: var(--color-ink-soft);
  margin-bottom: 12px;
}
.balloon-field {
  position: relative;
  height: 380px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #cfe3e8 0%, #e8dfc8 100%);
}
.balloon-field.not-my-turn { filter: saturate(0.5) brightness(0.9); }
.balloon {
  position: absolute;
  bottom: -160px;
  width: 112px;
  min-height: 120px;
  border-radius: 50% 50% 48% 48% / 58% 58% 42% 42%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 14px 10px;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  line-height: 1.25;
  box-shadow: inset -8px -10px 16px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(0, 0, 0, 0.15);
  animation: rise 7s ease-in forwards, sway 3s ease-in-out infinite;
  z-index: 2;
}
.not-my-turn .balloon { cursor: not-allowed; }
.balloon.c0 { background: var(--color-surya); }
.balloon.c1 { background: var(--color-almira); }
.balloon.c2 { background: var(--color-gold); color: var(--color-ink); }
.balloon.c3 { background: var(--color-good); }
@keyframes rise { from { bottom: -160px; } to { bottom: 420px; } }
@keyframes sway { 0%, 100% { margin-left: 0; } 50% { margin-left: 18px; } }
.balloon.popped { animation: popAnim 0.35s ease forwards !important; pointer-events: none; }
@keyframes popAnim { to { transform: scale(1.5); opacity: 0; } }
.balloon.sunk { animation: sinkAnim 0.5s ease forwards !important; pointer-events: none; }
@keyframes sinkAnim { to { transform: translateY(50px) scale(0.75); opacity: 0; } }
.balloon.glow { box-shadow: 0 0 0 4px var(--color-gold), inset -8px -10px 16px rgba(0, 0, 0, 0.12); }
.confetti { position: absolute; width: 8px; height: 8px; z-index: 3; pointer-events: none; animation: confettiFall 0.9s ease-out forwards; }
@keyframes confettiFall { to { transform: translateY(60px) rotate(200deg); opacity: 0; } }
.toast {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--color-ink); color: var(--color-paper); padding: 10px 18px; border-radius: 10px;
  font-size: 13px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); z-index: 50;
}
</style>
