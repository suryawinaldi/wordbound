<script setup>
import { ref, computed, watch as vueWatch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { CEFR_LEVELS, questionsForLevel } from '@/data/quiz-bank'
import { sfx } from '@/lib/sound'
import { useCoopSession } from '@/lib/coop'

const router = useRouter()
const auth = useAuthStore()
const playerStore = usePlayerStore(); const me = auth.currentUser?.uid; const other = auth.userData?.partnerUid; const myName = auth.userData?.displayName?.split(' ')[0] || 'Kamu'; const otherName = auth.partnerData?.displayName?.split(' ')[0] || 'Pasangan'
// other and names defined above

const PER_LEVEL = 3

// mode: null | 'solo' | 'coop'
const mode = ref(null)
const coop = useCoopSession('leveltest')

function buildQueue(tally) {
  const q = []
  CEFR_LEVELS.forEach((lvl) => {
    tally[lvl] = 0
    const pool = questionsForLevel(lvl)
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, PER_LEVEL)
    shuffled.forEach((item) => q.push({ ...item, level: lvl }))
  })
  return q
}
function estimateFrom(tally) {
  let est = 'A1'
  for (const lvl of CEFR_LEVELS) {
    if ((tally[lvl] || 0) >= Math.ceil(PER_LEVEL * 0.6)) est = lvl
    else break
  }
  return est
}

/* ---------------- Solo ---------------- */
const phase = ref('intro') // intro | playing | result
const queue = ref([])
const idx = ref(0)
const answered = ref(false)
const selected = ref(null)
const correctByLevel = ref({})
const estimatedLevel = ref('')

const current = computed(() => queue.value[idx.value])
const progressPct = computed(() => Math.round((idx.value / queue.value.length) * 100))

function start() {
  sfx.click()
  correctByLevel.value = {}
  queue.value = buildQueue(correctByLevel.value)
  idx.value = 0
  answered.value = false
  selected.value = null
  phase.value = 'playing'
}
function answer(i) {
  if (answered.value) return
  answered.value = true
  selected.value = i
  if (i === current.value.a) {
    correctByLevel.value[current.value.level] += 1
    sfx.correct()
  } else {
    sfx.wrong()
  }
  setTimeout(() => {
    if (idx.value + 1 >= queue.value.length) finish()
    else {
      idx.value += 1
      answered.value = false
      selected.value = null
    }
  }, 700)
}
async function finish() {
  const est = estimateFrom(correctByLevel.value)
  estimatedLevel.value = est
  phase.value = 'result'
  sfx.win()
  await playerStore.recordActivity({ cefrLevel: est })
}

/* ---------------- Coop (gantian jawab, tapi hasil level tetap per orang) ---------------- */
const coopAnswered = ref(false)
const coopSelected = ref(null)
const savedMine = ref(false)

const myTurn = computed(() => coop.session.value?.turn === me)
const coopCurrent = computed(() => coop.session.value?.queue?.[coop.session.value.idx])
const coopProgress = computed(() => (coop.session.value ? Math.round((coop.session.value.idx / coop.session.value.queue.length) * 100) : 0))
const myTally = computed(() => coop.session.value?.correctByLevel?.[me] || {})
const otherTally = computed(() => coop.session.value?.correctByLevel?.[other] || {})
const myEstimate = computed(() => estimateFrom(myTally.value))
const otherEstimate = computed(() => estimateFrom(otherTally.value))

async function startCoop() {
  sfx.click()
  const tallyTemplate = {}
  const q = buildQueue(tallyTemplate)
  savedMine.value = false
  await coop.createSession({
    queue: q,
    idx: 0,
    turn: me,
    status: 'playing',
    correctByLevel: { Surya: { ...tallyTemplate }, Almira: { ...tallyTemplate } },
  })
}
async function rematchCoop() {
  sfx.click()
  savedMine.value = false
  await coop.endSession()
}
async function coopAnswer(i) {
  if (coopAnswered.value || !myTurn.value || !coop.session.value) return
  coopAnswered.value = true
  coopSelected.value = i
  const sess = coop.session.value
  const q = coopCurrent.value
  const tally = { ...(sess.correctByLevel[me] || {}) }
  if (i === q.a) {
    tally[q.level] = (tally[q.level] || 0) + 1
    sfx.correct()
  } else {
    sfx.wrong()
  }
  setTimeout(async () => {
    const nextIdx = sess.idx + 1
    const isFinished = nextIdx >= sess.queue.length
    await coop.patchSession({
      idx: nextIdx,
      turn: other,
      status: isFinished ? 'finished' : 'playing',
      correctByLevel: { ...sess.correctByLevel, [me]: tally },
    })
    coopAnswered.value = false
    coopSelected.value = null
  }, 700)
}

function chooseMode(m) {
  sfx.click()
  mode.value = m
  if (m === 'coop') coop.watch()
}
function backToModeSelect() {
  sfx.click()
  mode.value = null
}

// Begitu sesi bareng selesai, simpan estimasi level masing-masing ke profil sendiri-sendiri.
vueWatch(
  () => coop.session.value?.status,
  async (status) => {
    if (mode.value === 'coop' && status === 'finished' && !savedMine.value) {
      savedMine.value = true
      await playerStore.recordActivity({ cefrLevel: myEstimate.value })
    }
  },
)
</script>

<template>
  <div class="text-center mb-5">
    <span class="eyebrow">📈 Tes Level CEFR</span>
    <h1 class="text-3xl" v-if="mode">Kamu ada di level mana?</h1>
    <h1 class="text-3xl" v-else>Pilih Mode</h1>
  </div>

  <!-- Mode picker -->
  <div v-if="!mode" class="card text-center">
    <p class="mb-4 text-[#6b675c]">Tes sendiri, atau bareng {{ otherName }} gantian jawab — hasil level kalian tetap dihitung sendiri-sendiri.</p>
    <div class="flex gap-3">
      <button class="btn btn-primary flex-1 py-5" @click="chooseMode('solo')">🧍 Solo<br /><span class="text-xs font-normal opacity-80">Tes sendiri</span></button>
      <button class="btn btn-outline flex-1 py-5" @click="chooseMode('coop')">🤝 Bareng<br /><span class="text-xs font-normal opacity-80">Gantian sama {{ otherName }}</span></button>
    </div>
  </div>

  <!-- ===== SOLO ===== -->
  <template v-else-if="mode === 'solo'">
    <div v-if="phase === 'intro'" class="card text-center py-8">
      <p class="text-[#6b675c] mb-1">{{ CEFR_LEVELS.length * PER_LEVEL }} soal, makin ke belakang makin susah (A1 → C2).</p>
      <p class="text-[#6b675c] mb-6">Di akhir, kamu dapat estimasi level CEFR kamu sekarang.</p>
      <button class="btn btn-primary" @click="start">Mulai Tes</button>
      <a class="block text-center text-sm mt-4 underline cursor-pointer" style="color:#9aa4a4" @click="backToModeSelect">← Ganti mode</a>
    </div>

    <div v-else-if="phase === 'result'" class="card text-center py-8">
      <div class="text-4xl mb-2">🎓</div>
      <h2 class="text-2xl">Level kamu: <span class="glow-gold">{{ estimatedLevel }}</span></h2>
      <p class="my-2.5 text-[#6b675c] text-sm">Ini estimasi kasar berdasarkan tes singkat — makin sering latihan, makin akurat trackingnya.</p>
      <div class="flex gap-2 justify-center flex-wrap my-3">
        <span v-for="lvl in CEFR_LEVELS" :key="lvl" class="pill" :style="lvl === estimatedLevel ? 'background: var(--color-gold); color: var(--color-ink)' : ''">
          {{ lvl }}: {{ correctByLevel[lvl] }}/{{ PER_LEVEL }}
        </span>
      </div>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
        <button class="btn btn-primary flex-1" @click="start">Tes Ulang</button>
      </div>
    </div>

    <div v-else class="card">
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
        <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: progressPct + '%' }" />
      </div>
      <span class="pill mb-3" style="display:inline-flex">{{ current.level }}</span>
      <div class="text-xl font-medium mb-5 leading-snug">{{ current.q }}</div>
      <button
        v-for="(opt, i) in current.opts"
        :key="i"
        class="opt"
        :class="{ pick: selected === i, correctPick: answered && i === current.a, wrongPick: answered && selected === i && i !== current.a }"
        @click="answer(i)"
      >
        {{ opt }}
      </button>
    </div>
  </template>

  <!-- ===== COOP ===== -->
  <template v-else>
    <div v-if="!coop.session.value" class="card text-center">
      <p class="mb-4 text-[#6b675c]">Belum ada sesi jalan. Mulai, nanti {{ otherName }} bisa langsung gabung dari HP-nya.</p>
      <button class="btn btn-primary w-full" @click="startCoop">Mulai Sesi Bareng</button>
      <a class="block text-center text-sm mt-4 underline cursor-pointer" style="color:#9aa4a4" @click="backToModeSelect">← Ganti mode</a>
    </div>

    <div v-else-if="coop.session.value.status === 'finished'" class="card text-center py-8">
      <div class="text-4xl mb-2">🎓</div>
      <h2 class="text-2xl mb-3">Hasil Kalian Berdua</h2>
      <div class="flex gap-3 justify-center mb-2">
        <div class="result-pill">
          <div class="text-xs" style="color:#8a8578">{{ myName }} (kamu)</div>
          <div class="text-xl glow-gold">{{ myEstimate }}</div>
        </div>
        <div class="result-pill">
          <div class="text-xs" style="color:#8a8578">{{ otherName }}</div>
          <div class="text-xl glow-gold">{{ otherEstimate }}</div>
        </div>
      </div>
      <p class="my-2.5 text-[#6b675c] text-sm">Estimasi kasar dari tes bareng ini — jawabnya gantian, tapi levelnya tetap dihitung sendiri-sendiri.</p>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
        <button class="btn btn-primary flex-1" @click="rematchCoop">Tes Ulang</button>
      </div>
    </div>

    <div v-else class="card">
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-3">
        <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: coopProgress + '%' }" />
      </div>
      <div
        class="text-center font-mono text-xs uppercase tracking-wide py-2 rounded-lg mb-3"
        :style="myTurn ? 'background: var(--color-gold); color: var(--color-ink); font-weight:600' : 'background: var(--color-paper-dim); color: var(--color-ink-soft)'"
      >
        {{ myTurn ? 'Giliran kamu jawab' : `Giliran ${other}...` }}
      </div>
      <span class="pill mb-3" style="display:inline-flex">{{ coopCurrent.level }}</span>
      <div class="text-xl font-medium mb-5 leading-snug">{{ coopCurrent.q }}</div>

      <template v-if="myTurn">
        <button
          v-for="(opt, i) in coopCurrent.opts"
          :key="i"
          class="opt"
          :class="{ pick: coopSelected === i, correctPick: coopAnswered && i === coopCurrent.a, wrongPick: coopAnswered && coopSelected === i && i !== coopCurrent.a }"
          @click="coopAnswer(i)"
        >
          {{ opt }}
        </button>
      </template>
      <div v-else class="py-6 text-center text-[#8a8578]">✋ Menunggu {{ otherName }} jawab...</div>
    </div>

    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-3 underline" style="color:#9aa4a4" @click="sfx.click()">Keluar</router-link>
  </template>
</template>

<style scoped>
.opt {
  display: block; width: 100%; text-align: left; background: #fff; border: 1.5px solid var(--color-paper-dim);
  border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; font-size: 15px; color: var(--color-ink);
  transition: all 0.15s ease;
}
.opt:hover { border-color: var(--color-ink); }
.opt.correctPick { background: rgba(127, 183, 126, 0.3); border-color: var(--color-good); }
.opt.wrongPick { background: rgba(217, 112, 95, 0.25); border-color: var(--color-bad); }
.result-pill { background: var(--color-paper-dim); border-radius: 12px; padding: 10px 18px; }
</style>
