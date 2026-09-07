<script setup>
import { ref, computed, watch as vueWatch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { sfx, speak } from '@/lib/sound'
import { autoLevelFromScore, buildPool, buildChoices, judgeTyped } from '@/data/listen-bank'

const auth = useAuthStore()
const playerStore = usePlayerStore(); const me = auth.currentUser?.uid; const other = auth.userData?.partnerUid; const myName = auth.userData?.displayName?.split(' ')[0] || 'Kamu'; const otherName = auth.partnerData?.displayName?.split(' ')[0] || 'Pasangan'
// other and names defined above
const myScore = computed(() => auth.userData?.score || 0)
const myLevel = computed(() => autoLevelFromScore(myScore.value))

const ROUND_SIZE = 8

// step: 'setup' -> 'solo' | 'battle'
const step = ref('setup')
const mainMode = ref('solo') // 'solo' | 'battle'
const contentType = ref('word') // 'word' | 'sentence'
const answerMode = ref('type') // 'type' | 'choice'

function pointsFor(result, plays) {
  if (result === 'correct') return plays === 1 ? 15 : 10
  if (result === 'close') return 4
  return 0
}

function goSetup() {
  sfx.click()
  step.value = 'setup'
}

/* ==================== SOLO ==================== */
const soloPhase = ref('intro') // intro | playing | reveal | finished
const soloPool = ref([])
const soloQi = ref(0)
const soloInput = ref('')
const soloChoices = ref([])
const soloPickedIdx = ref(null)
const soloScore = ref(0)
const soloCorrectCount = ref(0)
const soloStreak = ref(0)
const soloLastResult = ref(null)
const soloPlays = ref(0)
const soloCurrent = computed(() => soloPool.value[soloQi.value])
const soloProgressPct = computed(() => Math.round((soloQi.value / ROUND_SIZE) * 100))

function startSolo() {
  sfx.click()
  mainMode.value = 'solo'
  soloPool.value = buildPool(contentType.value, myLevel.value, ROUND_SIZE)
  soloQi.value = 0
  soloScore.value = 0
  soloCorrectCount.value = 0
  soloStreak.value = 0
  soloPlays.value = 0
  step.value = 'solo'
  soloPhase.value = 'playing'
  prepSoloQuestion()
  playSolo()
}
function prepSoloQuestion() {
  soloInput.value = ''
  soloPickedIdx.value = null
  soloPlays.value = 0
  if (answerMode.value === 'choice' && soloCurrent.value) {
    soloChoices.value = buildChoices(contentType.value, soloCurrent.value)
  }
}
function playSolo() {
  if (!soloCurrent.value) return
  sfx.click()
  soloPlays.value += 1
  speak(soloCurrent.value.text)
}
function submitSoloType() {
  if (!soloInput.value.trim()) return
  applySoloResult(judgeTyped(contentType.value, soloInput.value, soloCurrent.value.text))
}
function submitSoloChoice(idx) {
  if (soloPickedIdx.value !== null) return
  soloPickedIdx.value = idx
  const picked = soloChoices.value[idx]
  applySoloResult(picked.text === soloCurrent.value.text ? 'correct' : 'wrong')
}
function applySoloResult(result) {
  soloLastResult.value = result
  const bonus = pointsFor(result, soloPlays.value)
  soloScore.value += bonus
  if (result === 'correct') {
    soloCorrectCount.value += 1
    soloStreak.value += 1
    soloStreak.value % 3 === 0 ? sfx.combo() : sfx.correct()
  } else if (result === 'close') {
    soloStreak.value = 0
    sfx.tick()
  } else {
    soloStreak.value = 0
    sfx.wrong()
  }
  soloPhase.value = 'reveal'
}
function nextSolo() {
  if (soloQi.value + 1 >= soloPool.value.length) {
    finishSolo()
  } else {
    soloQi.value += 1
    soloPhase.value = 'playing'
    prepSoloQuestion()
    playSolo()
  }
}
async function finishSolo() {
  soloPhase.value = 'finished'
  soloScore.value >= soloPool.value.length * 8 ? sfx.win() : sfx.lose()
  await playerStore.recordActivity({
    score: (auth.userData?.score || 0) + soloScore.value,
    listenCorrect: (auth.userData?.listenCorrect || 0) + soloCorrectCount.value,
  })
}

/* ==================== BATTLE (balapan real-time) ==================== */
const BATTLE_DOC = doc(db, 'listenbattles', 'current')
const battle = ref(null)
let battleUnsub = null

const battlePhase = ref('lobby') // lobby | playing | finished
const battleQi = ref(0)
const battleInput = ref('')
const battleChoices = ref([])
const battlePickedIdx = ref(null)
const battleScore = ref(0)
const battleCorrectCount = ref(0)
const battlePlays = ref(0)
const battleLastResult = ref(null)
const battleFinished = ref(false)
const battleSavedResult = ref(false)

const battlePool = computed(() => battle.value?.pool || [])
const battleCurrent = computed(() => battlePool.value[battleQi.value])
const myBattleProgress = computed(() => battle.value?.players?.[me] || { qi: 0, score: 0, correct: 0, finished: false })
const otherBattleProgress = computed(() => battle.value?.players?.[other] || { qi: 0, score: 0, correct: 0, finished: false })
const bothFinished = computed(() => !!(battle.value && myBattleProgress.value.finished && otherBattleProgress.value.finished))

function watchBattle() {
  if (battleUnsub) return
  battleUnsub = onSnapshot(BATTLE_DOC, (snap) => {
    battle.value = snap.exists() ? snap.data() : null
  })
}
function stopWatchBattle() {
  if (battleUnsub) {
    battleUnsub()
    battleUnsub = null
  }
}

async function createBattle() {
  sfx.click()
  const pool = buildPool(contentType.value, myLevel.value, ROUND_SIZE)
  await setDoc(BATTLE_DOC, {
    contentType: contentType.value,
    answerMode: answerMode.value,
    pool,
    status: 'playing',
    createdBy: me,
    players: {
      Surya: { qi: 0, score: 0, correct: 0, finished: false },
      Almira: { qi: 0, score: 0, correct: 0, finished: false },
    },
  })
  enterBattlePlay()
}
function joinBattle() {
  sfx.click()
  enterBattlePlay()
}
function enterBattlePlay() {
  battleQi.value = 0
  battleScore.value = 0
  battleCorrectCount.value = 0
  battleFinished.value = false
  battleSavedResult.value = false
  step.value = 'battle'
  battlePhase.value = 'playing'
  prepBattleQuestion()
  playBattle()
}
function prepBattleQuestion() {
  battleInput.value = ''
  battlePickedIdx.value = null
  battlePlays.value = 0
  if (battle.value?.answerMode === 'choice' && battleCurrent.value) {
    battleChoices.value = buildChoices(battle.value.contentType, battleCurrent.value)
  }
}
function playBattle() {
  if (!battleCurrent.value) return
  sfx.click()
  battlePlays.value += 1
  speak(battleCurrent.value.text)
}
function submitBattleType() {
  if (!battleInput.value.trim()) return
  applyBattleResult(judgeTyped(battle.value.contentType, battleInput.value, battleCurrent.value.text))
}
function submitBattleChoice(idx) {
  if (battlePickedIdx.value !== null) return
  battlePickedIdx.value = idx
  const picked = battleChoices.value[idx]
  applyBattleResult(picked.text === battleCurrent.value.text ? 'correct' : 'wrong')
}
async function applyBattleResult(result) {
  battleLastResult.value = result
  const bonus = pointsFor(result, battlePlays.value)
  battleScore.value += bonus
  if (result === 'correct') {
    battleCorrectCount.value += 1
    sfx.correct()
  } else if (result === 'close') {
    sfx.tick()
  } else {
    sfx.wrong()
  }
  battlePhase.value = 'reveal'
  await patchMyBattleProgress({ qi: battleQi.value + 1, score: battleScore.value, correct: battleCorrectCount.value })
}
async function patchMyBattleProgress(patch) {
  await setDoc(BATTLE_DOC, { players: { [me]: patch } }, { merge: true })
}
async function nextBattle() {
  if (battleQi.value + 1 >= battlePool.value.length) {
    await finishBattle()
  } else {
    battleQi.value += 1
    battlePhase.value = 'playing'
    prepBattleQuestion()
    playBattle()
  }
}
async function finishBattle() {
  battlePhase.value = 'finished'
  battleFinished.value = true
  sfx.win()
  await patchMyBattleProgress({ qi: battlePool.value.length, score: battleScore.value, correct: battleCorrectCount.value, finished: true })
}
async function saveBattleResult(won) {
  if (battleSavedResult.value) return
  battleSavedResult.value = true
  await playerStore.recordActivity({
    score: (auth.userData?.score || 0) + battleScore.value,
    listenCorrect: (auth.userData?.listenCorrect || 0) + battleCorrectCount.value,
    listenBattleWins: (auth.userData?.listenBattleWins || 0) + (won ? 1 : 0),
  })
}
async function rematchBattle() {
  sfx.click()
  await deleteDoc(BATTLE_DOC)
  battle.value = null
  battlePhase.value = 'lobby'
}
function leaveBattleLobby() {
  sfx.click()
  stopWatchBattle()
  step.value = 'setup'
}

const battleWinner = computed(() => {
  if (!bothFinished.value) return null
  const mine = myBattleProgress.value
  const theirs = otherBattleProgress.value
  if (mine.score === theirs.score) {
    if (mine.correct === theirs.correct) return 'draw'
    return mine.correct > theirs.correct ? me : other
  }
  return mine.score > theirs.score ? me : other
})

vueWatch(bothFinished, (v) => {
  if (v && battleWinner.value) saveBattleResult(battleWinner.value === me)
})

function chooseMainMode(m) {
  sfx.click()
  mainMode.value = m
  if (m === 'battle') watchBattle()
}

onUnmounted(stopWatchBattle)
</script>

<template>
  <div class="text-center mb-5">
    <span class="eyebrow">🎧 Dengar &amp; Tulis</span>
    <h1 class="text-3xl" v-if="step === 'setup'">Atur Rondemu</h1>
    <h1 class="text-3xl" v-else-if="step === 'solo'">Mode Solo</h1>
    <h1 class="text-3xl" v-else>{{ myName }} <span class="text-lg" style="color:#B9C2C2">vs</span> {{ otherName }}</h1>
  </div>

  <!-- ===================== SETUP WIZARD ===================== -->
  <div v-if="step === 'setup'" class="card setup-card">
    <div class="flex justify-center mb-5">
      <span class="pill" style="background: var(--color-gold); color: var(--color-ink)">Level otomatis: {{ myLevel }}</span>
    </div>

    <div class="setup-block">
      <p class="setup-label">1. Apa yang mau kamu dengar?</p>
      <div class="choice-row">
        <button class="choice-btn" :class="{ active: contentType === 'word' }" @click="sfx.click(); contentType = 'word'">
          <span class="text-xl">🔤</span><span>Per Kata</span>
        </button>
        <button class="choice-btn" :class="{ active: contentType === 'sentence' }" @click="sfx.click(); contentType = 'sentence'">
          <span class="text-xl">📝</span><span>Per Kalimat</span>
        </button>
      </div>
    </div>

    <div class="setup-block">
      <p class="setup-label">2. Cara jawabnya?</p>
      <div class="choice-row">
        <button class="choice-btn" :class="{ active: answerMode === 'type' }" @click="sfx.click(); answerMode = 'type'">
          <span class="text-xl">⌨️</span><span>Ketik Sendiri</span>
        </button>
        <button class="choice-btn" :class="{ active: answerMode === 'choice' }" @click="sfx.click(); answerMode = 'choice'">
          <span class="text-xl">🔘</span><span>Pilihan Ganda</span>
        </button>
      </div>
    </div>

    <div class="setup-block">
      <p class="setup-label">3. Main sendiri atau balapan?</p>
      <div class="choice-row">
        <button class="choice-btn" :class="{ active: mainMode === 'solo' }" @click="chooseMainMode('solo')">
          <span class="text-xl">🧍</span><span>Solo</span>
        </button>
        <button class="choice-btn" :class="{ active: mainMode === 'battle' }" @click="chooseMainMode('battle')">
          <span class="text-xl">🏁</span><span>Balapan vs {{ otherName }}</span>
        </button>
      </div>
    </div>

    <button v-if="mainMode === 'solo'" class="btn btn-primary w-full mt-2" @click="startSolo">🔊 Mulai Dengarkan</button>

    <!-- Battle lobby inline within setup once battle chosen -->
    <template v-else>
      <div v-if="!battle" class="lobby-box mt-2">
        <p class="text-sm mb-3 text-center" style="color:#6b675c">Belum ada balapan jalan. Mulai sekarang — {{ otherName }} bisa langsung gabung dari HP-nya dengan pengaturan yang sama.</p>
        <button class="btn btn-primary w-full" @click="createBattle">🏁 Mulai Balapan Baru</button>
      </div>
      <div v-else-if="battle.status === 'playing' && !(myBattleProgress.finished)" class="lobby-box mt-2">
        <p class="text-sm mb-3 text-center" style="color:#6b675c">
          Ada balapan jalan ({{ battle.contentType === 'sentence' ? 'Kalimat' : 'Kata' }} · {{ battle.answerMode === 'choice' ? 'Pilihan Ganda' : 'Ketik Sendiri' }}), dibuat oleh {{ battle.createdBy }}.
        </p>
        <button class="btn btn-primary w-full" @click="joinBattle">🏁 Gabung &amp; Mulai</button>
      </div>
      <div v-else class="lobby-box mt-2 text-center">
        <p class="text-sm mb-3" style="color:#6b675c">Balapan sebelumnya masih menunggu {{ otherName }} selesai.</p>
        <button class="btn btn-outline w-full" @click="rematchBattle">Hapus &amp; Buat Baru</button>
      </div>
    </template>

    <router-link :to="{ name: 'dashboard' }" class="block text-center text-sm mt-4 underline" style="color:#9aa4a4" @click="sfx.click()">Kembali ke beranda</router-link>
  </div>

  <!-- ===================== SOLO PLAY ===================== -->
  <template v-else-if="step === 'solo'">
    <div v-if="soloPhase === 'finished'" class="card text-center py-8">
      <div class="text-4xl mb-2">{{ soloScore >= soloPool.length * 8 ? '🏆' : '🎧' }}</div>
      <h2 class="text-2xl">Selesai!</h2>
      <p class="my-2.5 text-[#6b675c]">Skor kamu: <strong>{{ soloScore }}</strong> · Benar {{ soloCorrectCount }}/{{ soloPool.length }}</p>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="goSetup">Ganti Pengaturan</button>
        <button class="btn btn-primary flex-1" @click="startSolo">Main Lagi</button>
      </div>
    </div>

    <div v-else>
      <div class="h-1.5 rounded bg-[var(--color-paper-dim)] overflow-hidden mb-4">
        <div class="h-full transition-all" style="background: var(--color-gold)" :style="{ width: soloProgressPct + '%' }" />
      </div>
      <div class="card text-center">
        <div class="flex justify-center items-center gap-2 mb-1 flex-wrap">
          <span class="pill">Soal {{ soloQi + 1 }}/{{ soloPool.length }}</span>
          <span class="pill" style="color: var(--color-gold)">Skor {{ soloScore }}</span>
          <span v-if="soloStreak > 1" class="pill glow-gold">🔥 x{{ soloStreak }}</span>
        </div>
        <div class="speaker-wrap my-6">
          <button class="speaker-btn" @click="playSolo" title="Putar lagi">🔊</button>
          <p class="text-xs mt-2" style="color:#8a8578">Tap untuk dengar ulang ({{ soloPlays }}x diputar)</p>
        </div>

        <template v-if="soloPhase === 'playing'">
          <template v-if="answerMode === 'type'">
            <input v-model="soloInput" type="text" autocomplete="off" autocapitalize="off"
              :placeholder="contentType === 'sentence' ? 'Ketik kalimat yang kamu dengar...' : 'Ketik kata yang kamu dengar...'"
              class="listen-input" @keyup.enter="submitSoloType" @keydown="sfx.tick()" />
            <button class="btn btn-primary w-full" @click="submitSoloType">Cek Jawaban</button>
          </template>
          <template v-else>
            <div class="choice-grid">
              <button v-for="(c, i) in soloChoices" :key="i" class="mc-btn" @click="submitSoloChoice(i)">{{ c.text }}</button>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="result-box" :class="soloLastResult">
            <div class="text-2xl mb-1">{{ soloLastResult === 'correct' ? '✅' : soloLastResult === 'close' ? '🤏' : '❌' }}</div>
            <p class="font-mono text-lg mb-1">{{ soloCurrent.text }}</p>
            <p class="text-sm mb-1" style="color:#6b675c">{{ soloCurrent.meaning }}</p>
            <p v-if="answerMode === 'type'" class="text-xs" style="color:#8a8578">Jawabanmu: "{{ soloInput }}"</p>
            <p v-else class="text-xs" style="color:#8a8578">Pilihanmu: "{{ soloChoices[soloPickedIdx]?.text }}"</p>
          </div>
          <button class="btn btn-primary w-full mt-4" @click="nextSolo">Lanjut →</button>
        </template>
      </div>
      <a class="block text-center text-sm mt-3 underline cursor-pointer" style="color:#9aa4a4" @click="goSetup">← Keluar</a>
    </div>
  </template>

  <!-- ===================== BATTLE PLAY ===================== -->
  <template v-else>
    <div v-if="bothFinished" class="card text-center py-8">
      <div class="text-4xl mb-2">{{ battleWinner === 'draw' ? '🤝' : battleWinner === me ? '🏆' : '🎧' }}</div>
      <h2 class="text-2xl">
        {{ battleWinner === 'draw' ? 'Seri!' : battleWinner === me ? 'Kamu menang!' : `${other} menang!` }}
      </h2>
      <div class="flex gap-3 mt-5 mb-2">
        <div class="race-result-card" :style="{ boxShadow: battleWinner === me ? '0 0 0 2px var(--color-gold) inset' : 'none' }">
          <div class="text-xs font-semibold" style="color:#8a8578">{{ myName }} (kamu)</div>
          <div class="font-mono text-2xl font-semibold my-1">{{ myBattleProgress.score }}</div>
          <div class="text-xs" style="color:#8a8578">Benar {{ myBattleProgress.correct }}/{{ battlePool.length }}</div>
        </div>
        <div class="race-result-card" :style="{ boxShadow: battleWinner === other ? '0 0 0 2px var(--color-gold) inset' : 'none' }">
          <div class="text-xs font-semibold" style="color:#8a8578">{{ otherName }}</div>
          <div class="font-mono text-2xl font-semibold my-1">{{ otherBattleProgress.score }}</div>
          <div class="text-xs" style="color:#8a8578">Benar {{ otherBattleProgress.correct }}/{{ battlePool.length }}</div>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-outline flex-1" @click="goSetup">Ganti Pengaturan</button>
        <button class="btn btn-primary flex-1" @click="rematchBattle">Balapan Lagi</button>
      </div>
    </div>

    <div v-else-if="battleFinished" class="card text-center py-10">
      <div class="text-4xl mb-3 pulse-wait">⏳</div>
      <p class="text-[#6b675c]">Kamu sudah selesai! Skor kamu: <strong>{{ battleScore }}</strong></p>
      <p class="text-sm mt-1" style="color:#8a8578">Menunggu {{ otherName }} menyelesaikan balapannya...</p>
      <div class="race-track mt-5">
        <div class="race-lane">
          <span class="race-label" style="color: var(--color-gold)">{{ otherName }}</span>
          <div class="race-bar"><div class="race-bar-fill" :style="{ width: (otherBattleProgress.qi / battlePool.length * 100) + '%' }" /></div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="race-track mb-4">
        <div class="race-lane">
          <span class="race-label">{{ myName }} (kamu)</span>
          <div class="race-bar"><div class="race-bar-fill mine" :style="{ width: (battleQi / battlePool.length * 100) + '%' }" /></div>
        </div>
        <div class="race-lane">
          <span class="race-label">{{ otherName }}</span>
          <div class="race-bar"><div class="race-bar-fill theirs" :style="{ width: (otherBattleProgress.qi / battlePool.length * 100) + '%' }" /></div>
        </div>
      </div>

      <div class="card text-center">
        <div class="flex justify-center items-center gap-2 mb-1 flex-wrap">
          <span class="pill">Soal {{ battleQi + 1 }}/{{ battlePool.length }}</span>
          <span class="pill" style="color: var(--color-gold)">Skor {{ battleScore }}</span>
        </div>
        <div class="speaker-wrap my-6">
          <button class="speaker-btn" @click="playBattle" title="Putar lagi">🔊</button>
          <p class="text-xs mt-2" style="color:#8a8578">Tap untuk dengar ulang ({{ battlePlays }}x diputar)</p>
        </div>

        <template v-if="battlePhase === 'playing'">
          <template v-if="battle.answerMode === 'type'">
            <input v-model="battleInput" type="text" autocomplete="off" autocapitalize="off"
              :placeholder="battle.contentType === 'sentence' ? 'Ketik kalimat yang kamu dengar...' : 'Ketik kata yang kamu dengar...'"
              class="listen-input" @keyup.enter="submitBattleType" @keydown="sfx.tick()" />
            <button class="btn btn-primary w-full" @click="submitBattleType">Cek Jawaban</button>
          </template>
          <template v-else>
            <div class="choice-grid">
              <button v-for="(c, i) in battleChoices" :key="i" class="mc-btn" @click="submitBattleChoice(i)">{{ c.text }}</button>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="result-box" :class="battleLastResult">
            <div class="text-2xl mb-1">{{ battleLastResult === 'correct' ? '✅' : battleLastResult === 'close' ? '🤏' : '❌' }}</div>
            <p class="font-mono text-lg mb-1">{{ battleCurrent.text }}</p>
            <p class="text-sm" style="color:#6b675c">{{ battleCurrent.meaning }}</p>
          </div>
          <button class="btn btn-primary w-full mt-4" @click="nextBattle">Lanjut →</button>
        </template>
      </div>
    </div>

    <a class="block text-center text-sm mt-3 underline cursor-pointer" style="color:#9aa4a4" @click="leaveBattleLobby">← Keluar</a>
  </template>
</template>

<style scoped>
.setup-card { animation: cardIn 0.35s cubic-bezier(.2,.9,.3,1.2); }
.setup-block { margin-bottom: 20px; }
.setup-label { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--color-ink-soft); }
.choice-row { display: flex; gap: 10px; }
.choice-btn {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px 8px;
  border-radius: 14px;
  border: 1.5px solid var(--color-paper-dim);
  background: transparent;
  color: var(--color-ink);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.choice-btn:hover { transform: translateY(-2px); border-color: var(--color-gold-dim); }
.choice-btn.active {
  border-color: var(--color-gold);
  background: rgba(232, 185, 68, 0.16);
  box-shadow: 0 4px 14px rgba(232, 185, 68, 0.25);
}
.lobby-box { animation: cardIn 0.3s ease; }

.speaker-btn {
  width: 84px; height: 84px; border-radius: 50%; border: none; font-size: 32px; cursor: pointer;
  background: radial-gradient(circle at 30% 30%, var(--color-gold), var(--color-gold-dim));
  box-shadow: 0 8px 24px rgba(232, 185, 68, 0.4);
  animation: speakerPulse 1.8s ease-in-out infinite;
}
@keyframes speakerPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }

.listen-input {
  width: 100%;
  border: 1.5px solid var(--color-paper-dim);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  text-align: center;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
  outline: none;
}
.listen-input:focus { border-color: var(--color-ink); }

.choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mc-btn {
  padding: 14px 10px;
  border-radius: 12px;
  border: 1.5px solid var(--color-paper-dim);
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mc-btn:hover { border-color: var(--color-gold); transform: translateY(-2px); background: rgba(232,185,68,0.1); }
.mc-btn:active { transform: translateY(0) scale(0.97); }

.result-box { border-radius: 14px; padding: 18px; background: var(--color-paper-dim); }
.result-box.correct { background: rgba(127, 183, 126, 0.25); }
.result-box.close { background: rgba(232, 185, 68, 0.25); }
.result-box.wrong { background: rgba(217, 112, 95, 0.2); }

.race-track { display: flex; flex-direction: column; gap: 8px; }
.race-lane { display: flex; align-items: center; gap: 8px; }
.race-label { width: 84px; font-size: 11px; font-family: var(--font-mono); flex-shrink: 0; }
.race-bar { flex: 1; height: 10px; border-radius: 999px; background: rgba(0,0,0,0.35); overflow: hidden; }
.race-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s cubic-bezier(.2,.9,.3,1); }
.race-bar-fill.mine { background: linear-gradient(90deg, var(--color-surya-dim), var(--color-surya)); }
.race-bar-fill.theirs { background: linear-gradient(90deg, var(--color-almira-dim), var(--color-almira)); }

.race-result-card {
  flex: 1;
  border-radius: 16px;
  padding: 16px;
  background: var(--color-paper-dim);
  text-align: center;
}
.pulse-wait { animation: pulseWait 1.4s ease-in-out infinite; }
@keyframes pulseWait { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
</style>
