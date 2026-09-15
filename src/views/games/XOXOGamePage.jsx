import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  const isLocal = room.id === 'local'
  const role = isHost ? 'host' : 'guest'

  const GRID_SIZE = room.settings?.gridSize || 10
  const WIN_CONDITION = room.settings?.winCondition || 5

  // Initialize state
  const state = room.state || {}
  const board = state.board || Array(GRID_SIZE * GRID_SIZE).fill(null)
  const turn = state.turn || 'host' // Host plays first
  const winner = state.winner || null // 'host', 'guest', 'draw'

  const amIWinner = isLocal ? (winner === 'host') : (winner === role)
  const isMyTurn = isLocal ? true : (turn === role && !winner)

  useEffect(() => {
    // If state is empty, host initializes the board
    if (isHost && !state.board) {
      updateState({ board: Array(GRID_SIZE * GRID_SIZE).fill(null), turn: 'host', winner: null })
    }
  }, [isHost, state.board])

  function checkWin(boardState, lastMoveIndex, playerRole) {
    const row = Math.floor(lastMoveIndex / GRID_SIZE)
    const col = lastMoveIndex % GRID_SIZE

    const checkDirection = (dRow, dCol) => {
      let count = 1
      // Check positive direction
      let r = row + dRow, c = col + dCol
      while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && boardState[r * GRID_SIZE + c] === playerRole) {
        count++
        r += dRow; c += dCol
      }
      // Check negative direction
      r = row - dRow; c = col - dCol
      while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && boardState[r * GRID_SIZE + c] === playerRole) {
        count++
        r -= dRow; c -= dCol
      }
      return count >= WIN_CONDITION
    }

    return (
      checkDirection(0, 1) || // Horizontal
      checkDirection(1, 0) || // Vertical
      checkDirection(1, 1) || // Diagonal \
      checkDirection(1, -1)   // Diagonal /
    )
  }

  async function handleCellClick(index) {
    if ((!isLocal && !isMyTurn) || board[index] !== null || winner) return
    
    sfx.click()
    const newBoard = [...board]
    const currentRole = isLocal ? turn : role
    newBoard[index] = currentRole
    
    let newWinner = null
    if (checkWin(newBoard, index, currentRole)) {
      newWinner = currentRole
      sfx.correct()
      if (!isLocal || currentRole === 'host') {
        usePlayerStore.getState().incrementStat('xoxoWins')
      }
    } else if (!newBoard.includes(null)) {
      newWinner = 'draw'
    }

    await updateState({
      board: newBoard,
      turn: currentRole === 'host' ? 'guest' : 'host',
      winner: newWinner
    })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  // Determine responsive grid size
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
  }

  // Size cap so it doesn't get ridiculously large on huge grids
  const maxCellSize = GRID_SIZE > 10 ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-10 sm:h-10'

  return (
    <GameLayout title="XOXO" subtitle={`Sambung ${WIN_CONDITION} untuk menang!`} onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4 px-2">
        
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn === 'host' ? 'bg-primary/10 shadow-glow-primary border border-primary/50' : 'opacity-50'}`}>
            <div className="w-10 h-10 rounded-full bg-sky-500/10 grid place-items-center"><X className="text-sky-500 w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase">{room.host.displayName}</p>
            </div>
          </div>
          
          <div className="text-sm font-black text-muted-foreground uppercase">VS</div>

          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn === 'guest' ? 'bg-primary/10 shadow-glow-primary border border-primary/50' : 'opacity-50'}`}>
            <div className="text-right">
              <p className="text-xs font-bold uppercase">{room.guest.displayName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 grid place-items-center"><Circle className="text-rose-500 w-5 h-5" /></div>
          </div>
        </div>

        <div className="text-center py-2">
          {!winner && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              {isLocal ? (turn === 'host' ? 'Giliran Pemain 1' : 'Giliran Pemain 2') : (turn === role ? 'Giliranmu' : 'Menunggu lawan...')}
            </span>
          )}
        </div>

        <div className="relative">
          <GlassCard className="p-2 sm:p-4 touch-none mx-auto w-fit">
            <div style={gridStyle} className="gap-1 sm:gap-1.5">
              {board.map((cell, i) => {
                const isX = cell === 'host'
                const isO = cell === 'guest'
                return (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    disabled={(!isLocal && !isMyTurn) || cell !== null || !!winner}
                    className={`${maxCellSize} rounded-sm sm:rounded-md flex items-center justify-center transition-colors
                      ${cell === null && (isLocal || isMyTurn) ? 'hover:bg-primary/20 bg-muted/30' : 'bg-muted/50'}
                      ${cell === null && (!isLocal && !isMyTurn) ? 'cursor-not-allowed' : ''}
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
                  {winner === 'draw' ? 'Seri!' : isLocal ? (winner === 'host' ? 'Pemain 1 Menang!' : 'Pemain 2 Menang!') : (amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!')}
                </h2>
                <button onClick={handleQuit} className="mt-4 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition">
                  Keluar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </GameLayout>
  )
}
