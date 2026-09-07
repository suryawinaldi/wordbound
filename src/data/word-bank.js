export const WORD_BANK = [
  'APPLE', 'TABLE', 'HAPPY', 'BRAVE', 'CLOUD', 'SMILE', 'QUIET', 'DANCE',
  'LIGHT', 'PEACE', 'DREAM', 'HEART', 'MUSIC', 'OCEAN', 'PLANT', 'SUGAR',
  'TIGER', 'WORLD', 'YOUTH', 'FRESH', 'GRAND', 'HONEY', 'JOLLY', 'LEMON',
  'MAGIC', 'NOBLE', 'PRIDE', 'RIVER', 'STORM', 'TRUST',
  'BREAD', 'CHAIR', 'DAILY', 'EARTH', 'FAITH', 'GLORY', 'HOUSE', 'IMAGE',
  'JUICE', 'KNEEL', 'LOYAL', 'MOUSE', 'NORTH', 'OFFER', 'PAPER', 'QUEEN',
  'RADIO', 'SHINE', 'TOAST', 'UNITY', 'VOICE', 'WATCH', 'YIELD', 'ZEBRA',
  'BEACH', 'CANDY', 'DELTA', 'EAGLE', 'FLAME', 'GRAPE',
]

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Classic Wordle feedback: returns array of 'correct' | 'present' | 'absent' for each letter of guess */
export function scoreGuess(guess, answer) {
  const result = Array(5).fill('absent')
  const answerLetters = answer.split('')
  const guessLetters = guess.split('')
  const used = Array(5).fill(false)

  // First pass: correct positions
  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = 'correct'
      used[i] = true
    }
  })

  // Second pass: present but wrong position
  guessLetters.forEach((letter, i) => {
    if (result[i] === 'correct') return
    const idx = answerLetters.findIndex((a, j) => a === letter && !used[j])
    if (idx !== -1) {
      result[i] = 'present'
      used[idx] = true
    }
  })

  return result
}
