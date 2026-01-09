// @ts-nocheck - react-chessboard type definitions are incompatible
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useUser } from '@clerk/clerk-react'
import { ArrowLeft, Wallet } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import { walletService } from '@/services/WalletService'
import { formatEspoCoins } from '@/utils/espoCoin'
import type { Match } from '@/types/match'
import type { Wallet as WalletType } from '@/types'
import toast from 'react-hot-toast'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

import { useChessBots } from '@/hooks/useChessBots'

// Simple Error Boundary to catch render crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any, errorInfo: any }> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Game Crash:", error, errorInfo)
        this.setState({ error, errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-[var(--accent)] font-bold">
                    <span className="text-4xl mb-4">⚠️</span>
                    <p className="text-xl mb-4">Game Error</p>
                    <p className="text-sm text-[var(--text-secondary)] font-mono bg-black/20 p-4 rounded max-w-lg break-all">
                        {this.state.error?.toString() || 'Unknown Error'}
                        <br />
                        {this.state.errorInfo?.componentStack?.slice(0, 200)}...
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-[var(--accent)] text-black rounded-lg hover:opacity-90"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={() => window.location.href = '/play'}
                        className="mt-4 text-sm text-[var(--text-secondary)] hover:text-white"
                    >
                        Back to Hub
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

const ChessGameContent = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useUser()
    const navigate = useNavigate()
    const [match, setMatch] = useState<Match | null>(null)
    const [chess] = useState(new Chess())
    const [fen, setFen] = useState(chess.fen())
    const [gameOver, setGameOver] = useState(false)
    const [winner, setWinner] = useState<string | null>(null)
    const [wallet, setWallet] = useState<WalletType | null>(null)

    // Timer States
    const [whiteTime, setWhiteTime] = useState<number>(600)
    const [blackTime, setBlackTime] = useState<number>(600)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const botMoveTimer = useRef<NodeJS.Timeout | null>(null)

    // Debug Log
    useEffect(() => {
        if (match) console.log("Match State:", match)
        if (fen) console.log("Current FEN:", fen)
    }, [match, fen])

    useEffect(() => {
        if (user) {
            // Load initial wallet
            walletService.getWallet(user.id).then(setWallet)

            // Listen to real-time wallet updates
            const handleWalletUpdate = (e: CustomEvent<WalletType>) => {
                setWallet(e.detail)
            }
            window.addEventListener('walletUpdate' as any, handleWalletUpdate)
            return () => window.removeEventListener('walletUpdate' as any, handleWalletUpdate)
        }
    }, [user])

    useEffect(() => {
        if (!id) return

        const unsubscribe = matchService.listenToMatch(id, (updatedMatch) => {
            if (!updatedMatch) return
            setMatch(updatedMatch)

            // Load game state
            if (updatedMatch.gameState?.fen) {
                const currentFen = chess.fen()
                // Only load if different to avoid jitter, but bot move might need strict sync
                if (updatedMatch.gameState.fen !== currentFen) {
                    try {
                        chess.load(updatedMatch.gameState.fen)
                        setFen(chess.fen())
                    } catch (e) {
                        console.error("Invalid FEN from server:", updatedMatch.gameState.fen)
                    }
                }
            }

            // Sync Timers from Server State
            if (updatedMatch.gameState?.whiteTimeRemaining !== undefined) {
                setWhiteTime(updatedMatch.gameState.whiteTimeRemaining)
            }
            if (updatedMatch.gameState?.blackTimeRemaining !== undefined) {
                setBlackTime(updatedMatch.gameState.blackTimeRemaining)
            }

            // Check if game completed
            if (updatedMatch.status === 'completed') {
                setGameOver(true)
                setWinner(updatedMatch.winnerName || null)
            }
        })

        return () => unsubscribe()
    }, [id])

    // Initialize Timer from Match Settings (Only if not already in GameState)
    useEffect(() => {
        if (match?.timeControl && !match.gameState?.whiteTimeRemaining) {
            setWhiteTime(match.timeControl)
            setBlackTime(match.timeControl)
        }
    }, [match?.id]) // Run once when match loads

    // Timer Logic
    useEffect(() => {
        if (!match || gameOver) {
            if (timerRef.current) clearInterval(timerRef.current)
            return
        }

        // Clear existing timer
        if (timerRef.current) clearInterval(timerRef.current)

        // Only run timer if game is in progress and enough players
        if (match.status !== 'locked' && match.status !== 'in_progress') return
        if (!match.players || match.players.length < 2) return

        timerRef.current = setInterval(() => {
            if (chess.turn() === 'w') {
                setWhiteTime(prev => {
                    if (prev <= 0) {
                        handleTimeout('black')
                        return 0
                    }
                    return prev - 1
                })
            } else {
                setBlackTime(prev => {
                    if (prev <= 0) {
                        handleTimeout('white')
                        return 0
                    }
                    return prev - 1
                })
            }
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [match, gameOver, chess.turn()])

    const handleTimeout = async (winnerColor: 'white' | 'black') => {
        if (!match || !id) return
        setGameOver(true)
        const winnerIndex = winnerColor === 'white' ? 0 : 1
        const winnerId = match.players[winnerIndex].userId
        const winnerName = match.players[winnerIndex].userName
        setWinner(winnerName)

        // Update Firestore
        const matchRef = doc(db, 'matches', id)
        await updateDoc(matchRef, {
            status: 'completed',
            winnerId,
            winnerName,
            completedAt: new Date().toISOString()
        })
        toast.error(`Time's up! ${winnerName} wins!`)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }


    // Bot Logic Hook - ALWAYS called
    useChessBots(id, match, chess, setFen, gameOver, user?.id, whiteTime, blackTime)

    // Handlers
    const onDrop = async (sourceSquare: string, targetSquare: string) => {
        if (!match || gameOver) return false

        // Prevent moving if it's not my turn
        const isWhite = match.players[0].userId === user?.id
        const isBlack = match.players[1].userId === user?.id

        if (isWhite && chess.turn() !== 'w') return false
        if (isBlack && chess.turn() !== 'b') return false
        if (!isWhite && !isBlack) return false // Spectator

        try {
            const move = chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            })

            if (move === null) return false

            const newFen = chess.fen()
            setFen(newFen)

            // Sync with Firestore
            if (id) {
                const matchRef = doc(db, 'matches', id)
                await updateDoc(matchRef, {
                    'gameState.fen': newFen,
                    'gameState.lastMove': { from: move.from, to: move.to, san: move.san },
                    'gameState.whiteTimeRemaining': whiteTime,
                    'gameState.blackTimeRemaining': blackTime,
                    'gameState.updatedAt': new Date().toISOString()
                })
            }

            // Check game over
            if (chess.isGameOver()) {
                handleGameOver()
            }

            return true
        } catch (error) {
            console.error('Move error:', error)
            return false
        }
    }

    const handleGameOver = async () => {
        if (!match || !id || gameOver) return

        setGameOver(true)

        let winnerId = ''
        let winnerName = ''

        if (chess.isCheckmate()) {
            const currentTurn = chess.turn()
            const loserColor = currentTurn
            const winnerPlayer = match.players.find((_, idx) =>
                (loserColor === 'w' && idx === 1) || (loserColor === 'b' && idx === 0)
            )

            if (winnerPlayer) {
                winnerId = winnerPlayer.userId
                winnerName = winnerPlayer.userName
            }
        } else if (chess.isDraw()) {
            winnerName = 'Draw'
        }

        setWinner(winnerName)

        // Only one person submits result to avoid race conditions. 
        // If bot match, human submits.
        // If PvP, usually winner submits or server (we don't have server listener).
        // Let's rely on whoever detects it first, Firestore rules usually handle idempotency or we accept overwrite.

        if (winnerId) {
            // If winner is Bot, we still need to submit result so match closes
            // If I am the human playing, I submit regardless of who won
            await matchService.submitResult({
                matchId: id,
                winnerId,
                winnerName,
                submittedBy: user?.id || 'system',
                submittedAt: new Date().toISOString(),
                verified: true
            })

            // Credit winner if human and paid (Bots can't win money, Paid is human only anyway)
            if (match.mode === 'paid' && !match.players.find(p => p.userId === winnerId)?.isBot) {
                await walletService.creditMatchWinnings(match.winnerPrize, winnerId, id)
                if (winnerId === user?.id) {
                    toast.success(`You won ${match.winnerPrize} Espo Coins!`, {
                        duration: 5000,
                        icon: '🏆'
                    })
                }
            }
        }
    }

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Timeout if match doesn't load
        const timer = setTimeout(() => {
            if (!match) {
                setError('Failed to load match. Please check your connection.')
            }
        }, 10000)
        return () => clearTimeout(timer)
    }, [match])

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
                <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                <button
                    onClick={() => navigate('/play')}
                    className="px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-xl hover:opacity-90 transition-all"
                >
                    Back to Hub
                </button>
            </div>
        )
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
                    <p className="text-[var(--accent)] font-mono animate-pulse">Initializing Game...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 lg:pb-8 relative">

            {/* HUD - Wallet Balance */}
            {wallet && (
                <div className="absolute top-4 right-4 lg:right-8 z-50 flex items-center gap-2 px-4 py-2 bg-[var(--glass)]/90 backdrop-blur-md border border-[var(--accent)]/30 rounded-full shadow-[0_0_15px_rgba(0,255,194,0.1)]">
                    <Wallet className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-bold font-mono text-sm">
                        {formatEspoCoins(wallet.espoCoins)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] border-l border-[var(--border)] pl-2">
                        (₹{(wallet.espoCoins / 2.5).toFixed(0)})
                    </span>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/play')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Play
                </button>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Chess Board */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-[var(--glass)] p-4 rounded-2xl border border-[var(--border)] relative">
                            {/* Player Info HUD (Opponent) */}
                            <div className="flex justify-between items-center mb-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold border border-red-500/30">
                                        {match.players.find(p => p.userId !== user?.id)?.userName?.charAt(0) || '?'}
                                    </div>
                                    <span className="font-bold text-sm">
                                        {match.players.find(p => p.userId !== user?.id)?.userName || 'Opponent'}
                                        {match.players.find(p => p.userId !== user?.id)?.isBot && <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">BOT</span>}
                                    </span>
                                </div>
                            </div>

                            {/* @ts-ignore - react-chessboard types issue */}
                            <Chessboard
                                position={fen || 'start'}
                                onPieceDrop={makeMove}
                                boardWidth={600}
                                customBoardStyle={{ borderRadius: '8px' }}
                            />

                            {/* Player Info HUD (You) */}
                            <div className="flex justify-between items-center mt-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xs font-bold border border-[var(--accent)]/30">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <span className="font-bold text-sm">You</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="w-full lg:w-1/3 space-y-4">
                        <div className="p-6 bg-[var(--glass)] rounded-xl border border-[var(--border)]">
                            <h2 className="text-xl font-black mb-4">Match Info</h2>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Game</p>
                                    <p className="font-bold">Chess</p>
                                </div>

                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Mode</p>
                                    <p className="font-bold">{match.mode === 'free' ? 'Free Play' : `Paid (${match.entryFee} EC entry)`}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Players</p>
                                    {Array.isArray(match.players) && match.players.map((player) => (
                                        <div key={player.userId} className="flex items-center gap-2 mt-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-xs font-bold">
                                                {player.userName ? player.userName.charAt(0) : '?'}
                                            </div>
                                            <p className="text-sm">{player.userName || 'Unknown'}</p>
                                            {player.userId === user?.id && (
                                                <span className="text-xs text-[var(--accent)]">(You)</span>
                                            )}
                                            {player.isBot && (
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">BOT</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {gameOver && winner && (
                                    <div className="mt-6 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg">
                                        <p className="text-center font-black text-[var(--accent)] text-lg">
                                            🏆 {winner} Wins!
                                        </p>
                                        {match.mode === 'paid' && (
                                            <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                                                Prize: {match.winnerPrize} EC
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!gameOver && (
                            <div className="flex gap-4">
                                <div className={`flex-1 p-4 rounded-lg border ${chess.turn() === 'w' ? 'bg-green-500/20 border-green-500/50' : 'bg-[var(--glass)] border-[var(--border)]'}`}>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">White Time</p>
                                    <p className="text-2xl font-mono font-bold">{formatTime(whiteTime)}</p>
                                </div>
                                <div className={`flex-1 p-4 rounded-lg border ${chess.turn() === 'b' ? 'bg-green-500/20 border-green-500/50' : 'bg-[var(--glass)] border-[var(--border)]'}`}>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Black Time</p>
                                    <p className="text-2xl font-mono font-bold">{formatTime(blackTime)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const ChessGame = () => {
    return (
        <ErrorBoundary>
            <ChessGameContent />
        </ErrorBoundary>
    )
}

export default ChessGame
