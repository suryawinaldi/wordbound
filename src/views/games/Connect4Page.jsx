import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, ArrowRight } from 'lucide-react'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const ROWS = 6
const COLS = 7

function checkWin(board, player) {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[c + r * COLS] === player &&
        board[c + 1 + r * COLS] === player &&
        board[c + 2 + r * COLS] === player &&
        board[c + 3 + r * COLS] === player
      ) return true
    }
  }
  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (
        board[c + r * COLS] === player &&
        board[c + (r + 1) * COLS] === player &&
        board[c + (r + 2) * COLS] === player &&
        board[c + (r + 3) * COLS] === player
      ) return true
    }
  }
  // Diagonal Right
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[c + r * COLS] === player &&
        board[c + 1 + (r + 1) * COLS] === player &&
        board[c + 2 + (r + 2) * COLS] === player &&
        board[c + 3 + (r + 3) * COLS] === player
      ) return true
    }
  }
  // Diagonal Left
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if (
        board[c + r * COLS] === player &&
        board[c - 1 + (r + 1) * COLS] === player &&
        board[c - 2 + (r + 2) * COLS] === player &&
        board[c - 3 + (r + 3) * COLS] === player
      ) return true
    }
  }
  return false
}

export default function Connect4Page() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="connect4" gameName="Connect 4" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <Connect4Board />
}

function Connect4Board() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const { incrementStat, recordActivity } = usePlayerStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const isLocal = room.id === 'local'
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const board = state.board || Array(ROWS * COLS).fill(null)
  const turn = state.turn || 'host'
  const winner = state.winner || null // 'host' | 'guest' | 'draw'

  useEffect(() => {
    if (isHost && !state.board) {
      updateState({ board: Array(ROWS * COLS).fill(null), turn: 'host', winner: null })
    }
  }, [isHost, state.board])

  async function handleColumnClick(c) {
    if (winner || (!isLocal && turn !== role)) return

    // Find lowest empty row in this column
    let targetRow = -1
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[c + r * COLS] === null) {
        targetRow = r
        break
      }
    }

    if (targetRow === -1) return // Column is full

    sfx.click()

    const newBoard = [...board]
    newBoard[c + targetRow * COLS] = turn

    let newWinner = null
    if (checkWin(newBoard, turn)) {
      newWinner = turn
      if (!isLocal || turn === 'host') {
        incrementStat('connect4Wins')
        recordActivity()
      }
      sfx.correct()
    } else if (!newBoard.includes(null)) {
      newWinner = 'draw'
      if (!isLocal) recordActivity()
    }

    const nextTurn = turn === 'host' ? 'guest' : 'host'
    await updateState({ board: newBoard, turn: nextTurn, winner: newWinner })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  const amIWinner = isLocal ? (winner === 'host') : (winner === role)

  return (
    <GameLayout title="Connect 4" subtitle="Jejerkan 4 warna berturut-turut!" onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header / Player Info */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn === 'host' ? 'bg-primary/10 shadow-glow-primary border border-primary/50' : 'opacity-50'}`}>
            <div className="w-10 h-10 rounded-full bg-rose-500 shadow-inner grid place-items-center border-4 border-rose-600"></div>
            <div>
              <p className="text-xs font-bold uppercase">{room.host.displayName}</p>
            </div>
          </div>
          
          <div className="text-sm font-black text-muted-foreground uppercase">VS</div>

          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn === 'guest' ? 'bg-primary/10 shadow-glow-primary border border-primary/50' : 'opacity-50'}`}>
            <div className="text-right">
              <p className="text-xs font-bold uppercase">{room.guest.displayName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 shadow-inner grid place-items-center border-4 border-amber-500"></div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center py-2">
          {winner ? (
            <div className="inline-block px-4 py-2 rounded-xl bg-primary/20 text-primary font-black animate-pulse">
              {winner === 'draw' ? 'SERI!' : (isLocal ? (winner === 'host' ? 'Pemain 1 Menang!' : 'Pemain 2 Menang!') : (winner === role ? 'KAMU MENANG!' : 'KAMU KALAH!'))}
            </div>
          ) : (
            <div className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              {isLocal ? (turn === 'host' ? 'Giliran Pemain 1' : 'Giliran Pemain 2') : (turn === role ? 'Giliranmu (Pilih Kolom)' : 'Menunggu lawan...')}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="relative bg-blue-600 p-3 sm:p-4 rounded-3xl shadow-[0_10px_0_0_#1e40af] border-4 border-blue-500 touch-none">
          <div className="grid grid-cols-7 gap-2">
            {Array(COLS).fill(0).map((_, c) => (
              <div 
                key={`col-${c}`}
                className="flex flex-col gap-2 cursor-pointer group relative"
                onClick={() => handleColumnClick(c)}
              >
                {/* Hover indicator for column */}
                {!winner && (isLocal || turn === role) && (
                  <div className="absolute -top-12 inset-x-0 h-10 opacity-0 group-hover:opacity-100 transition duration-200 flex justify-center">
                    <div className={`w-10 h-10 rounded-full ${turn === 'host' ? 'bg-rose-500/50' : 'bg-amber-400/50'} animate-bounce`}></div>
                  </div>
                )}
                
                {Array(ROWS).fill(0).map((_, r) => {
                  const val = board[c + r * COLS]
                  return (
                    <div key={`cell-${r}-${c}`} className="aspect-square bg-blue-800 rounded-full shadow-inner overflow-hidden relative">
                      <AnimatePresence>
                        {val && (
                          <motion.div
                            initial={{ y: -300, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                            className={`absolute inset-0 rounded-full ${val === 'host' ? 'bg-rose-500' : 'bg-amber-400'} shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.2)]`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {winner && (
          <div className="pt-4">
            <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition">
              Kembali
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
