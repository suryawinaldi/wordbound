// Kata untuk mode Echo Type: didengar (TTS), lalu diketik + ditebak artinya.
export const ECHO_BANK = [
  { level: 'A1', word: 'apple', meaning: 'apel' },
  { level: 'A1', word: 'happy', meaning: 'senang' },
  { level: 'A1', word: 'water', meaning: 'air' },
  { level: 'A1', word: 'friend', meaning: 'teman' },
  { level: 'A1', word: 'house', meaning: 'rumah' },
  { level: 'A2', word: 'borrow', meaning: 'meminjam' },
  { level: 'A2', word: 'crowded', meaning: 'ramai/padat' },
  { level: 'A2', word: 'nervous', meaning: 'gugup' },
  { level: 'A2', word: 'arrive', meaning: 'tiba' },
  { level: 'A2', word: 'expensive', meaning: 'mahal' },
  { level: 'B1', word: 'generous', meaning: 'murah hati' },
  { level: 'B1', word: 'reluctant', meaning: 'enggan' },
  { level: 'B1', word: 'grateful', meaning: 'bersyukur' },
  { level: 'B1', word: 'curious', meaning: 'ingin tahu' },
  { level: 'B1', word: 'procrastinate', meaning: 'menunda-nunda' },
  { level: 'B2', word: 'ambitious', meaning: 'berambisi tinggi' },
  { level: 'B2', word: 'diligent', meaning: 'rajin' },
  { level: 'B2', word: 'humble', meaning: 'rendah hati' },
  { level: 'B2', word: 'stubborn', meaning: 'keras kepala' },
  { level: 'B2', word: 'enormous', meaning: 'sangat besar' },
  { level: 'C1', word: 'meticulous', meaning: 'sangat teliti' },
  { level: 'C1', word: 'ubiquitous', meaning: 'ada di mana-mana' },
  { level: 'C1', word: 'ambiguous', meaning: 'bermakna ganda' },
  { level: 'C1', word: 'candid', meaning: 'terus terang' },
  { level: 'C1', word: 'redundant', meaning: 'berlebih/tidak diperlukan' },
  { level: 'C2', word: 'ephemeral', meaning: 'sementara, cepat hilang' },
  { level: 'C2', word: 'ostensibly', meaning: 'kelihatannya (belum tentu benar)' },
  { level: 'C2', word: 'vindicate', meaning: 'membuktikan tidak bersalah' },
  { level: 'C2', word: 'cognizant', meaning: 'menyadari/mengetahui' },
  { level: 'C2', word: 'meticulousness', meaning: 'ketelitian yang sangat tinggi' },
]

export function echoWordsUpToLevel(level) {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const cutoff = order.indexOf(level) >= 0 ? order.indexOf(level) : order.length - 1
  const allowed = order.slice(0, cutoff + 1)
  return ECHO_BANK.filter((w) => allowed.includes(w.level))
}
