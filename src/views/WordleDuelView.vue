<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { WORD_BANK, scoreGuess } from '@/data/word-bank'
import { sfx } from '@/lib/sound'

const auth = useAuthStore()
const playerStore = usePlayerStore(); const me = auth.currentUser?.uid; const other = auth.userData?.partnerUid; const myName = auth.userData?.displayName?.split(' ')[0] || 'Kamu'; const otherName = auth.partnerData?.displayName?.split(' ')[0] || 'Pasangan'
// other and names defined above

// mode: null (belum pilih) | 'solo' | 'duel'
const mode = ref(null)

/* ---------------- Duel (real-time, dua orang) ---------------- */
const duel = ref(null)
const duelInput = ref('')
const duelError = ref('')
const duelShake = ref(false)
let unsub = null

const myTurn = computed(() => duel.value?.turn === me)
const duelAttemptsLeft = computed(() => (duel.value ? duel.value.maxAttempts - duel.value.guesses.length : 0))

function watchDuel() {
  if (unsub) return
  unsub = onSnapshot(doc(db, 'duels', 'current'), (snap) => {
    duel.value = snap.exists() ? snap.data() : null
  })
}

async function startDuel(maxAttempts) {
  const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
  await setDoc(doc(db, 'duels', 'current'), {
    word,
    maxAttempts,
    guesses: [],
    turn: me,
    status: 'playing',
    winner: null,
  })
  sfx.click()
}

async function submitDuelGuess() {
  duelError.value = ''
  const g = duelInput.value.trim().toUpperCase()
  if (g.length !== 5) {
    duelError.value = 'Kata harus 5 huruf.'
    triggerShake(duelShake)
    sfx.wrong()
    return
  }
  if (!/^[A-Z]{5}$/.test(g)) {
    duelError.value = 'Cuma huruf A-Z ya.'
    triggerShake(duelShake)
    sfx.wrong()
    return
  }

  const feedback = scoreGuess(g, duel.value.word)
  const newGuesses = [...duel.value.guesses, { player: me, word: g, feedback }]
  const won = g === duel.value.word
  const exhausted = newGuesses.length >= duel.value.maxAttempts

  await setDoc(
    doc(db, 'duels', 'current'),
    {
      guesses: newGuesses,
      turn: other,
      status: won || exhausted ? 'finished' : 'playing',
      winner: won ? me : null,
    },
    { merge: true },
  )

  if (won) {
    sfx.win()
    await playerStore.recordActivity({ duelWins: (auth.userData?.duelWins || 0) + 1 })
  } else if (exhausted) {
    sfx.lose()
  } else {
    sfx.correct()
  }
  duelInput.value = ''
}

// "Duel Lagi" beneran mengosongkan dokumen di server, bukan cuma state lokal —
// supaya kalau halaman ini dibuka ulang nanti nggak nyangkut di game yang sudah selesai.
async function rematch() {
  sfx.click()
  await deleteDoc(doc(db, 'duels', 'current'))
  duel.value = null
}

/* ---------------- Solo (instan, tanpa nunggu pasangan) ---------------- */
const MAX_SOLO_ATTEMPTS = 6
const soloWord = ref('')
const soloGuesses = ref([])
const soloInput = ref('')
const soloError = ref('')
const soloShake = ref(false)
const soloStatus = ref('playing') // playing | won | lost

function startSolo() {
  soloWord.value = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
  soloGuesses.value = []
  soloInput.value = ''
  soloError.value = ''
  soloStatus.value = 'playing'
  sfx.click()
}

async function submitSoloGuess() {
  soloError.value = ''
  const g = soloInput.value.trim().toUpperCase()
  if (g.length !== 5) {
    soloError.value = 'Kata harus 5 huruf.'
    triggerShake(soloShake)
    sfx.wrong()
    return
  }
  if (!/^[A-Z]{5}$/.test(g)) {
    soloError.value = 'Cuma huruf A-Z ya.'
    triggerShake(soloShake)
    sfx.wrong()
    return
  }

  const feedback = scoreGuess(g, soloWord.value)
  soloGuesses.value.push({ word: g, feedback })
  const won = g === soloWord.value
  const exhausted = soloGuesses.value.length >= MAX_SOLO_ATTEMPTS

  if (won) {
    soloStatus.value = 'won'
    sfx.win()
    await playerStore.recordActivity({ soloWordleWins: (auth.userData?.soloWordleWins || 0) + 1 })
  } else if (exhausted) {
    soloStatus.value = 'lost'
    sfx.lose()
  } else {
    sfx.correct()
  }
  soloInput.value = ''
}

const soloAttemptsLeft = computed(() => MAX_SOLO_ATTEMPTS - soloGuesses.value.length)

/* ---------------- Shared helpers ---------------- */
function triggerShake(flag) {
  flag.value = true
  setTimeout(() => (flag.value = false), 400)
}

function chooseMode(m) {
  sfx.click()
  mode.value = m
  if (m === 'duel') watchDuel()
}

function backToModeSelect() {
  sfx.click()
  mode.value = null
}

onUnmounted(() => unsub && unsub())
</script>

<template>
  <div class="text-center mb-5">
    <span class="eyebrow">Wordle</span>
    <h1 class="text-3xl" v-if="mode === 'duel'">{{ myName }} <span class="text-lg text-[#B9C2C2]">vs</span> {{ otherName }}</h1>
    <h1 class="text-3xl" v-else-if="mode === 'solo'">Mode Solo</h1>
    <h1 class="text-3xl" v-else>Pilih Mode</h1>
  </div>

  <!-- Mode picker -->
  <div v-if="!mode" class="card text-center mode-picker">
    <p class="mb-4 text-[#6b675c]">Mau main sendiri langsung, atau duel gantian sama {{ otherName }}?</p>
    <div class="flex gap-3">
      <button class="btn btn-primary flex-1 py-5" @click="chooseMode('solo')">
        🧍 Solo<br /><span class="text-xs font-normal opacity-80">Main instan, gak nunggu</span>
      </button>
      <button class="btn btn-outline flex-1 py-5" @click="chooseMode('duel')">
        ⚔️ Duel<br /><span class="text-xs font-normal opacity-80">Gantian lawan {{ otherName }}</span>
      </button>
    </div>
  </div>

  <!-- ===== SOLO MODE ===== -->
  <template v-else-if="mode === 'solo'">
    <div v-if="!soloWord" class="card text-center">
      <p class="mb-4 text-[#6b675c]">Tebak kata 5 huruf sendirian — {{ MAX_SOLO_ATTEMPTS }}x kesempatan, langsung mulai!</p>
      <button class="btn btn-primary w-full" @click="startSolo">Mulai Main</button>
    </div>

    <template v-else>
      <div v-if="soloStatus !== 'playing'" class="card text-center py-8">
        <div class="text-4xl mb-2">{{ soloStatus === 'won' ? '🎉' : '📖' }}</div>
        <h2 class="text-2xl">{{ soloStatus === 'won' ? 'Kamu menang!' : 'Kesempatan habis' }}</h2>
        <p class="my-2.5 text-[#6b675c]">
          Kata rahasianya: <strong class="font-mono tracking-widest">{{ soloWord }}</strong>
        </p>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
          <button class="btn btn-primary flex-1" @click="startSolo">Main Lagi</button>
        </div>
      </div>

      <div v-else class="card">
        <div class="text-center font-mono text-xs uppercase tracking-wide py-2.5 rounded-lg mb-4" style="background: var(--color-paper-dim); color: var(--color-ink-soft)">
          Sisa {{ soloAttemptsLeft }}x tebakan
        </div>

        <div class="flex flex-col gap-1.5 mb-4">
          <div v-for="(g, gi) in soloGuesses" :key="gi" class="flex gap-1 justify-center">
            <div v-for="(letter, li) in g.word.split('')" :key="li" class="wordle-tile" :class="g.feedback[li]">
              {{ letter }}
            </div>
          </div>
        </div>

        <div class="flex gap-2" :class="{ shake: soloShake }">
          <input
            v-model="soloInput"
            maxlength="5"
            placeholder="TEBAK5"
            class="flex-1 border-[1.5px] rounded-xl px-4 py-3 uppercase font-mono tracking-widest outline-none focus:border-[var(--color-ink)]"
            style="border-color: var(--color-paper-dim)"
            @keyup.enter="submitSoloGuess"
            @keydown="sfx.tick()"
          />
          <button class="btn btn-primary" @click="submitSoloGuess">Tebak</button>
        </div>
        <p v-if="soloError" class="text-sm mt-2 text-center" style="color: var(--color-bad)">{{ soloError }}</p>
      </div>
    </template>

    <a class="block text-center text-sm mt-3 underline cursor-pointer" style="color: #9aa4a4" @click="backToModeSelect">
      ← Ganti mode
    </a>
  </template>

  <!-- ===== DUEL MODE ===== -->
  <template v-else>
    <div v-if="!duel" class="card text-center">
      <p class="mb-4 text-[#6b675c]">Mulai duel baru — pilih jumlah kesempatan tebak (dipakai gantian berdua):</p>
      <div class="flex gap-3">
        <button class="btn btn-outline flex-1" @click="startDuel(3)">3x</button>
        <button class="btn btn-outline flex-1" @click="startDuel(5)">5x</button>
        <button class="btn btn-outline flex-1" @click="startDuel(7)">7x</button>
      </div>
    </div>

    <template v-else>
      <div v-if="duel.status === 'finished'" class="card text-center py-8">
        <div class="text-4xl mb-2">{{ duel.winner ? '🎉' : '📖' }}</div>
        <h2 class="text-2xl">
          {{ duel.winner === me ? 'Kamu menang!' : duel.winner ? duel.winner + ' menang!' : 'Kesempatan habis' }}
        </h2>
        <p class="my-2.5 text-[#6b675c]">
          Kata rahasianya: <strong class="font-mono tracking-widest">{{ duel.word }}</strong>
        </p>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-outline flex-1" @click="backToModeSelect">Ganti Mode</button>
          <button class="btn btn-primary flex-1" @click="rematch">Duel Lagi</button>
        </div>
      </div>

      <div v-else class="card">
        <div
          class="text-center font-mono text-xs uppercase tracking-wide py-2.5 rounded-lg mb-4"
          :style="myTurn ? 'background: var(--color-gold); color: var(--color-ink); font-weight:600' : 'background: var(--color-paper-dim); color: var(--color-ink-soft)'"
        >
          {{ myTurn ? 'Giliran kamu menebak' : `Menunggu ${other}...` }} · sisa {{ duelAttemptsLeft }}x
        </div>

        <div class="flex flex-col gap-1.5 mb-4">
          <div v-for="(g, gi) in duel.guesses" :key="gi" class="flex items-center gap-2">
            <div class="w-14 text-[10px] uppercase font-mono" :style="{ color: g.player === 'Surya' ? 'var(--color-surya)' : 'var(--color-almira)' }">
              {{ g.player }}
            </div>
            <div class="flex gap-1">
              <div v-for="(letter, li) in g.word.split('')" :key="li" class="wordle-tile" :class="g.feedback[li]" style="width:38px;height:38px;font-size:16px">
                {{ letter }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="myTurn" class="flex gap-2" :class="{ shake: duelShake }">
          <input
            v-model="duelInput"
            maxlength="5"
            placeholder="TEBAK5"
            class="flex-1 border-[1.5px] rounded-xl px-4 py-3 uppercase font-mono tracking-widest outline-none focus:border-[var(--color-ink)]"
            style="border-color: var(--color-paper-dim)"
            @keyup.enter="submitDuelGuess"
            @keydown="sfx.tick()"
          />
          <button class="btn btn-primary" @click="submitDuelGuess">Tebak</button>
        </div>
        <p v-if="duelError" class="text-sm mt-2 text-center" style="color: var(--color-bad)">{{ duelError }}</p>
      </div>
    </template>

    <a class="block text-center text-sm mt-3 underline cursor-pointer" style="color: #9aa4a4" @click="backToModeSelect">
      ← Ganti mode
    </a>
  </template>

  <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-2 underline" style="color: #9aa4a4" @click="sfx.click()">
    Kembali ke beranda
  </router-link>
</template>

<style scoped>
.shake { animation: shakeAnim 0.4s ease; }
@keyframes shakeAnim { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.mode-picker { animation: cardIn 0.35s cubic-bezier(.2,.9,.3,1.2); }
</style>
