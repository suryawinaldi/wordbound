import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Circle, X } from 'lucide-react'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

export default function XOXOGamePage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  const [gridSize, setGridSize] = useState(10)
  const [winCondition, setWinCondition] = useState(5)

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4 pb-8 overflow-y-auto">
        <MultiplayerLobby 
          gameId="xoxo" 
          gameName="XOXO Custom" 
          customSettings={{ gridSize, winCondition }}
          settingsUI={
            <div className="bg-background/40 p-4 rounded-2xl border border-border space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                  Luas Papan (Grid) <span>{gridSize}x{gridSize}</span>
                </label>
                <input 
                  type="range" min="6" max="15" step="1" 
                  value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                  Syarat Menang (Sambung) <span>{winCondition} Simbol</span>
                </label>
                <input 
                  type="range" min="3" max="7" step="1" 
                  value={winCondition} onChange={(e) => setWinCondition(parseInt(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
                {winCondition > gridSize && (
                  <p className="text-[0.65rem] text-destructive mt-1">Syarat menang tidak boleh lebih besar dari luas papan!</p>
                )}
              </div>
            </div>
          }
          onBack={() => navigate('/games')} 
        />
      </div>
    )
  }

  return <XOXOBoard />
}

function XOXOBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const GRID_SIZE = room.settings?.gridSize || 10
  const WIN_CONDITION = room.settings?.winCondition || 5

  // Initialize state
  const state = room.state || {}
  const board = state.board || Array(GRID_SIZE * GRID_SIZE).fill(null)
  const turn = state.turn || 'host' // Host plays first
  const winner = state.winner || null // 'host', 'guest', 'draw'

  const amIWinner = winner === role
  const isMyTurn = turn === role && !winner

  useEffect(() => {
    // If state is empty, host initializes the board
    if (isHost && !state.board) {
      updateState({ board: Array(GRID_SIZE * GRID_SIZE).fill(null), turn: 'host', winner: null })
    }
  }, [isHost, state, GRID_SIZE])

  function checkWin(newBoard, index, playerStr) {
    const x = index % GRID_SIZE
    const y = Math.floor(index / GRID_SIZE)

    const dirs = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ]

    for (let [dx, dy] of dirs) {
      let count = 1
      
      // forward
      let curX = x + dx
      let curY = y + dy
      while (curX >= 0 && curX < GRID_SIZE && curY >= 0 && curY < GRID_SIZE && newBoard[curY * GRID_SIZE + curX] === playerStr) {
        count++
        curX += dx
        curY += dy
      }
      
      // backward
      curX = x - dx
      curY = y - dy
      while (curX >= 0 && curX < GRID_SIZE && curY >= 0 && curY < GRID_SIZE && newBoard[curY * GRID_SIZE + curX] === playerStr) {
        count++
        curX -= dx
        curY -= dy
      }

      if (count >= WIN_CONDITION) return true
    }
    return false
  }

  async function handleCellClick(index) {
    if (!isMyTurn || board[index] !== null || winner) return
    
    sfx.click()
    const newBoard = [...board]
    newBoard[index] = role
    
    let newWinner = null
    if (checkWin(newBoard, index, role)) {
      newWinner = role
      sfx.correct()
      usePlayerStore.getState().incrementStat('xoxoWins')
    } else if (!newBoard.includes(null)) {
      newWinner = 'draw'
    }

    await updateState({
      board: newBoard,
      turn: role === 'host' ? 'guest' : 'host',
      winner: newWinner
    })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  // Calculate dynamic tailwind classes based on grid size
  const maxCellSize = GRID_SIZE > 10 ? 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10'

  return (
    <GameLayout 
      title={`XOXO Custom (${GRID_SIZE}x${GRID_SIZE})`} 
      subtitle={`Sambung ${WIN_CONDITION} untuk Menang`} 
      onBack={handleQuit}
    >
      {amIWinner && <Confetti />}

      <div className="flex flex-col items-center justify-between min-h-[65vh] py-2">
        
        {/* Opponent Info */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition ${turn === (isHost ? 'guest' : 'host') && !winner ? 'bg-primary/20 scale-105' : 'opacity-50'}`}>
          <img src={opponent.photoURL} className="w-10 h-10 rounded-full" alt="" />
          <div>
            <p className="font-bold text-sm">{opponent.displayName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Simbol: {isHost ? <Circle className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </p>
          </div>
        </div>

        {/* Board */}
        <div className="relative my-4 overflow-x-auto w-full max-w-full flex justify-center">
          <GlassCard className="p-2 sm:p-4 border-2 border-primary/20 shadow-glow-primary inline-block">
            <div 
              className="grid gap-1 sm:gap-1.5 mx-auto"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {board.map((cell, i) => {
                const isX = cell === 'host'
                const isO = cell === 'guest'
                return (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    disabled={!isMyTurn || cell !== null || !!winner}
                    className={`${maxCellSize} rounded-sm sm:rounded-md flex items-center justify-center transition-colors
                      ${cell === null && isMyTurn ? 'hover:bg-primary/20 bg-muted/30' : 'bg-muted/50'}
                      ${cell === null && !isMyTurn ? 'cursor-not-allowed' : ''}
                    `}
                  >
                    {isX && <X className="w-[60%] h-[60%] text-sky-400 drop-shadow-md" />}
                    {isO && <Circle className="w-[60%] h-[60%] text-rose-400 drop-shadow-md" />}
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Winner Overlay */}
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="absolute inset-0 z-10 bg-background/80 backdrop-blur flex flex-col items-center justify-center rounded-3xl"
              >
                <h2 className="text-3xl font-black mb-2 text-primary drop-shadow-lg">
                  {winner === 'draw' ? 'Seri!' : amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!'}
                </h2>
                <button onClick={handleQuit} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-xl">Kembali ke Menu</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Info */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition ${isMyTurn ? 'bg-primary/20 scale-105 shadow-glow-primary' : 'opacity-50'}`}>
          <div>
            <p className="font-bold text-sm text-right">Kamu</p>
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              Simbol: {isHost ? <X className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            </p>
          </div>
          <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`} className="w-10 h-10 rounded-full" alt="" />
        </div>

      </div>
    </GameLayout>
  )
}
