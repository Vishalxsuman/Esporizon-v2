import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Trophy, Shield, Eye } from 'lucide-react'
import { matchService } from '@/services/MatchService'
import type { GameState, Card } from '@/types/match'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useCard29GameState } from '@/hooks/useCard29GameState'
import { useCard29Bots } from '@/hooks/useCard29Bots'
import { PlayerSeat } from '@/components/PlayerSeat'
import { GameHeader } from '@/components/GameHeader'

// Reusable Card Component for 29 (Local to this file or imported)
const Card29View = ({ card, size = 'md' }: { card: Card, size?: 'sm' | 'md' | 'lg' }) => {
    const isRed = card.suit === 'H' || card.suit === 'D'
    const suitIcon = card.suit === 'H' ? '♥️' : card.suit === 'D' ? '♦️' : card.suit === 'C' ? '♣️' : '♠️'

    const sizeStyles = {
        sm: { w: 'w-10', h: 'h-14', text: 'text-[10px]', icon: 'text-xs' },
        md: { w: 'w-14 md:w-16', h: 'h-20 md:h-24', text: 'text-[10px] md:text-sm', icon: 'text-lg md:text-xl' },
        lg: { w: 'w-16 md:w-24', h: 'h-24 md:h-36', text: 'text-[10px] md:text-base', icon: 'text-2xl md:text-4xl' }
    }
    const s = sizeStyles[size]

    return (
        <div className={`bg-white text-black rounded-lg ${s.w} ${s.h} flex flex-col justify-between p-1.5 shadow-xl border border-gray-200 relative`}>
            {/* Top Left */}
            <div className={`flex flex-col items-center leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span className={`font-black uppercase ${s.text}`}>{card.rank}</span>
                <span className="text-[10px]">{suitIcon}</span>
            </div>

            {/* Center Big Icon */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 ${isRed ? 'text-red-500' : 'text-slate-800'} ${s.icon}`}>
                {suitIcon}
            </div>

            {/* Bottom Right (Rotated) */}
            <div className={`flex flex-col items-center leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span className={`font-black uppercase ${s.text}`}>{card.rank}</span>
                <span className="text-[10px]">{suitIcon}</span>
            </div>
        </div>
    )
}

const getTimeLeft = (gameState: any) => {
    if (!gameState || !gameState.turnStartedAt) return 'Starting…'
    const now = Date.now()

    // Handle both Firestore Timestamp and ISO string/Date
    let startedAtMs: number
    try {
        if (gameState.turnStartedAt && typeof gameState.turnStartedAt.toMillis === 'function') {
            startedAtMs = gameState.turnStartedAt.toMillis()
        } else if (gameState.turnStartedAt && gameState.turnStartedAt.seconds) {
            startedAtMs = gameState.turnStartedAt.seconds * 1000
        } else {
            startedAtMs = new Date(gameState.turnStartedAt).getTime()
        }

        if (isNaN(startedAtMs)) return 'Starting…'
    } catch (e) {
        return 'Starting…'
    }

    const duration = gameState.turnDuration || 30
    const diff = Math.max(0, duration - Math.floor((now - startedAtMs) / 1000))
    const mins = Math.floor(diff / 60)
    const secs = diff % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Card29Game = () => {
    const { id } = useParams<{ id: string }>()
    const { user } = useUser()
    const navigate = useNavigate()

    const [showHistory, setShowHistory] = useState(false)
    const { match, gameState } = useCard29GameState(id)
    const isHost = match?.creatorId === user?.id

    useCard29Bots(id, match, gameState, user?.id, isHost)

    const [timeoutOccurred, setTimeoutOccurred] = useState(false)
    const [playerLeftName, setPlayerLeftName] = useState<string | null>(null)
    const [showBidSelector, setShowBidSelector] = useState(false)

    // Monitor for timeouts and disconnections
    useEffect(() => {
        if (!gameState || gameState.phase === 'completed') return

        const timer = setInterval(() => {
            const timeLeft = getTimeLeft(gameState)
            if (timeLeft === '0:00' && gameState.phase !== 'completed') {
                setTimeoutOccurred(true)
            }
        }, 1000)

        // Check for player left (if real players decrease)
        // Note: This is simplified; in a production app we'd track specific presence
        if (match && match.players.length < match.maxPlayers && !match.withBots && gameState.phase !== ('completed' as any)) {
            setPlayerLeftName('A player')
        }

        return () => clearInterval(timer)
    }, [gameState, match])

    // Game initialization - deal 4 cards
    useEffect(() => {
        if (!match || !id || !isHost) return
        if (match.players.length < match.maxPlayers) return
        if (gameState?.hands && Object.keys(gameState.hands).length > 0) return

        const initializeDeck = async () => {
            const suits: Array<'H' | 'D' | 'C' | 'S'> = ['H', 'D', 'C', 'S']
            const ranks: Array<'7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A']
            const deck: Card[] = []
            suits.forEach(suit => ranks.forEach(rank => deck.push({ suit, rank })))
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]]
            }

            const hands: { [key: string]: Card[] } = {}
            const dealerIndex = gameState?.dealerIndex !== undefined ? gameState.dealerIndex : 0
            const firstPlayerToReceive = (dealerIndex + 3) % 4 // RHS of dealer

            // Deal exactly 4 cards to each player starting from RHS of dealer
            match.players.forEach((_, idx) => {
                const seatToReceive = (firstPlayerToReceive - idx + 4) % 4 // Counter-clockwise
                const player = match.players[seatToReceive]
                hands[player.userId] = deck.slice(idx * 4, (idx + 1) * 4)
            })

            const newState: GameState = {
                hands,
                currentTrick: [],
                tricks: {},
                gamePoints: gameState?.gamePoints || { team1: 0, team2: 0 },
                trumpSuit: null,
                currentPlayer: (dealerIndex + 3) % 4, // Starts from RHS
                round: gameState?.round || 1,
                scores: Object.fromEntries(match.players.map(p => [p.userId, 0])),
                turnStartedAt: serverTimestamp(),
                turnDuration: 30,
                bids: {},
                currentBidder: (dealerIndex + 3) % 4,
                highestBid: null,
                bidWinner: null,
                phase: 'bidding',
                dealerIndex: dealerIndex,
                pairShown: false,
                lastTrickCards: [],
                secondDealComplete: false,
                remainingDeck: deck.slice(16),
                bainPhase: 'none',
                isDoubled: false,
                isRedoubled: false,
                singleHandMode: false
            }

            await updateDoc(doc(db, 'matches', id), { gameState: newState })
        }
        initializeDeck()
    }, [match?.players.length, match?.id, isHost, gameState?.hands])


    const playCard = async (card: Card) => {
        if (!id || !user || !gameState) return
        try {
            await matchService.playCard29(id, user.id, card, gameState, match!.players)
        } catch (error: any) {
            toast.error(error.message || "Invalid move!")
        }
    }

    const makeBid = async (amount: number | 'pass') => {
        if (!match || !gameState || !id || !user) return
        try {
            await matchService.makeBid29(id, user.id, amount, gameState, match.players)
        } catch (error: any) {
            toast.error(error.message || "Bidding failed")
        }
    }

    const handleBainAction = async (action: 'double' | 'redouble' | 'skip') => {
        if (!gameState || !id) return
        let { bainPhase, isDoubled, isRedoubled } = gameState
        if (bainPhase === 'double_chance') {
            if (action === 'double') { isDoubled = true; bainPhase = 'redouble_chance' }
            else bainPhase = 'none'
        } else if (bainPhase === 'redouble_chance') {
            if (action === 'redouble') isRedoubled = true
            bainPhase = 'none'
        }
        await updateDoc(doc(db, 'matches', id), { gameState: { ...gameState, bainPhase, isDoubled, isRedoubled, turnStartedAt: serverTimestamp() } })
    }

    const handleTrumpSelect = async (suit: string) => {
        if (!gameState || !id || !match || !user) return
        try {
            await matchService.selectTrump29(id, user.id, suit, gameState, match.players)
        } catch (error: any) {
            toast.error(error.message || "Failed to select trump")
        }
    }

    const revealTrump = async () => {
        if (!id || !gameState) return
        try {
            await matchService.revealTrump29(id, gameState)
        } catch (error: any) {
            toast.error("Failed to reveal trump")
        }
    }

    if (!match || !gameState) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-cyan-400 font-mono">Loading Game...</div>

    const myHand = gameState.hands[user?.id || ''] || []
    const mySeat = match.players.findIndex(p => p.userId === user?.id)
    const isMyTurn = gameState.phase === 'bidding' ? gameState.currentBidder === mySeat : gameState.currentPlayer === mySeat

    // Circular positions
    const leftSeat = (mySeat + 1) % 4
    const topSeat = (mySeat + 2) % 4
    const rightSeat = (mySeat + 3) % 4

    // Calculate Round Points
    const team1RoundPoints = (gameState.scores?.[match.players[0]?.userId] || 0) + (gameState.scores?.[match.players[2]?.userId] || 0)
    const team2RoundPoints = (gameState.scores?.[match.players[1]?.userId] || 0) + (gameState.scores?.[match.players[3]?.userId] || 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2537] to-[#1a3a52] text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/fake-luxury.png')]" />



            {/* Game Header */}
            <GameHeader
                gameState={gameState}
                mySeat={mySeat}
                team1RoundPoints={team1RoundPoints}
                team2RoundPoints={team2RoundPoints}
            />

            {/* Main Game Container - Moved up for better visibility */}
            <div className="flex items-start justify-center min-h-screen pt-20 md:pt-24 pb-24 overflow-hidden fixed inset-0">
                <div className="relative w-full max-w-4xl aspect-square max-h-[85vh]">
                    {/* Last Hand History Toggle - Draggable Button */}
                    {gameState.lastTrickCards && gameState.lastTrickCards.length >= 4 && gameState.phase !== 'bidding' && (
                        <motion.button
                            drag
                            dragConstraints={{ left: -100, right: 300, top: -200, bottom: 200 }}
                            initial={{ x: 0, opacity: 0 }}
                            animate={{ x: 20, opacity: 1 }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(6, 182, 212, 0.4)' }}
                            whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                            onClick={() => setShowHistory(!showHistory)}
                            className={`absolute left-0 bottom-32 md:bottom-40 z-30 w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-xl backdrop-blur-md ${showHistory ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-[#1a3a52]/60 border-white/20 text-white'
                                }`}
                        >
                            <span className="text-[10px] font-black uppercase leading-none text-center pointer-events-none">Last<br />Hand</span>
                        </motion.button>
                    )}

                    {/* Last Trick Cards Mini-Display */}
                    <AnimatePresence>
                        {showHistory && gameState.lastTrickCards && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-48 left-8 z-30 bg-[#1a1f2e]/90 backdrop-blur-lg border border-cyan-500/30 p-3 rounded-2xl shadow-2xl flex gap-1.5"
                            >
                                {gameState.lastTrickCards.map((turn: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <Card29View card={turn.card} size="sm" />
                                        <span className="text-[8px] text-white/60 font-medium truncate w-10 text-center">{turn.playerName}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Center Table */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#2d5016] via-[#1f3a0f] to-[#0f1e08] border-[12px] border-[#3d2b1f] shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_100px_rgba(0,0,0,0.7)] flex items-center justify-center">
                            {/* Felt Texture */}
                            <div className="absolute inset-0 opacity-20 rounded-full bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />

                            {/* Inner Gold Trim */}
                            <div className="absolute inset-4 border-2 border-yellow-900/20 rounded-full" />

                            {/* Cards on Table */}
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <AnimatePresence>
                                    {gameState.currentTrick.map((turn, i) => {
                                        const pIdx = match.players.findIndex(p => p.userId === turn.playerId)
                                        const seatPos = (pIdx - mySeat + 4) % 4
                                        const seatCoords = [{ x: 0, y: 220 }, { x: -220, y: 0 }, { x: 0, y: -220 }, { x: 220, y: 0 }]
                                        // Targeted diamond positions in the center
                                        const playPositions = [{ x: 0, y: 60 }, { x: -60, y: 0 }, { x: 0, y: -60 }, { x: 60, y: 0 }]

                                        let exitTarget: any = { y: -220, opacity: 0 }
                                        if (gameState.lastWinnerId) {
                                            const winnerIdx = match.players.findIndex(p => p.userId === gameState.lastWinnerId)
                                            const winnerSeatPos = (winnerIdx - mySeat + 4) % 4
                                            if (winnerSeatPos !== -1) {
                                                exitTarget = { ...seatCoords[winnerSeatPos], opacity: 0, scale: 0.3 }
                                            }
                                        }

                                        return (
                                            <motion.div
                                                key={`${turn.playerId}-${turn.card.rank}-${i}`}
                                                initial={{ ...seatCoords[seatPos], opacity: 0, scale: 0.5, rotate: 0 }}
                                                animate={{
                                                    ...playPositions[seatPos],
                                                    opacity: 1,
                                                    scale: 1,
                                                    rotate: (seatPos * 90) + (i * 2 - 4) // Each card points towards player or slight random-ish tilt
                                                }}
                                                exit={{ ...exitTarget, transition: { duration: 0.6, ease: "circIn" } }}
                                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                            >
                                                <Card29View card={turn.card} size="md" />
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Player Seats */}
                    <PlayerSeat
                        position="bottom"
                        player={match.players[mySeat]}
                        isActive={isMyTurn}
                        isCurrentUser={true}
                        tricksWon={0}
                        playerNumber={1}
                        turnStartedAt={gameState.turnStartedAt}
                        turnDuration={gameState.turnDuration}
                        currentBid={gameState.bids[match.players[mySeat].userId]}
                        gamePhase={gameState.phase}
                    />
                    <PlayerSeat
                        position="left"
                        player={match.players[leftSeat]}
                        isActive={gameState.currentPlayer === leftSeat}
                        isCurrentUser={false}
                        tricksWon={0}
                        playerNumber={2}
                        turnStartedAt={gameState.turnStartedAt}
                        turnDuration={gameState.turnDuration}
                        currentBid={gameState.bids[match.players[leftSeat].userId]}
                        gamePhase={gameState.phase}
                    />
                    <PlayerSeat
                        position="top"
                        player={match.players[topSeat]}
                        isActive={gameState.currentPlayer === topSeat}
                        isCurrentUser={false}
                        tricksWon={0}
                        playerNumber={3}
                        turnStartedAt={gameState.turnStartedAt}
                        turnDuration={gameState.turnDuration}
                        currentBid={gameState.bids[match.players[topSeat].userId]}
                        gamePhase={gameState.phase}
                    />
                    <PlayerSeat
                        position="right"
                        player={match.players[rightSeat]}
                        isActive={gameState.currentPlayer === rightSeat}
                        isCurrentUser={false}
                        tricksWon={0}
                        playerNumber={4}
                        turnStartedAt={gameState.turnStartedAt}
                        turnDuration={gameState.turnDuration}
                        currentBid={gameState.bids[match.players[rightSeat].userId]}
                        gamePhase={gameState.phase}
                    />
                </div>
            </div>



            {/* User's Hand - Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-40">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">

                    {/* Action Bar - Remove Last Hand button, only show during playing phase */}
                    <div className="flex flex-col items-center gap-3 mb-2">
                        <div className="flex items-center gap-4">

                            {/* Declare Pair Button - Only during playing phase */}
                            {gameState.phase === 'playing' && isMyTurn && gameState.trumpRevealed && !gameState.pairDeclaredBy && (() => {
                                const hasKing = myHand.some(c => c.suit === gameState.trumpSuit && c.rank === 'K')
                                const hasQueen = myHand.some(c => c.suit === gameState.trumpSuit && c.rank === 'Q')
                                if (hasKing && hasQueen) {
                                    return (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await matchService.declarePair29(id!, user!.id, gameState, match!.players)
                                                    toast.success("Pair Declared!")
                                                } catch (e: any) {
                                                    toast.error(e.message)
                                                }
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black rounded-xl shadow-xl hover:scale-105 transition-all text-[10px] tracking-widest uppercase"
                                        >
                                            Declare Pair
                                        </button>
                                    )
                                }
                                return null
                            })()}
                        </div>

                        {/* Player Hand - 4x4 Grid for 8 cards */}
                        <div className="grid grid-cols-4 md:flex md:justify-center gap-2 md:gap-0 pb-6 w-full px-4 items-end min-h-[160px] max-w-lg mx-auto">
                            {myHand.map((card, i) => {
                                let isPlayable = isMyTurn
                                if (isMyTurn && gameState.currentTrick.length > 0) {
                                    const led = gameState.currentTrick[0].card.suit
                                    const hasLedSuit = myHand.some(c => c.suit === led)
                                    if (hasLedSuit) {
                                        isPlayable = card.suit === led
                                    } else if (gameState.trumpRevealed && gameState.trumpSuit) {
                                        const hasTrump = myHand.some(c => c.suit === gameState.trumpSuit)
                                        if (hasTrump) {
                                            isPlayable = card.suit === gameState.trumpSuit
                                        }
                                    }
                                }
                                const isInitialDeal = myHand.length <= 4
                                return (
                                    <motion.button
                                        key={i}
                                        onClick={() => playCard(card)}
                                        disabled={!isPlayable}
                                        whileHover={isPlayable ? { y: -20, scale: 1.05, zIndex: 50 } : {}}
                                        className={`relative transition-all ${isInitialDeal ? '' : ''} ${isPlayable ? 'cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed'}`}
                                    >
                                        <Card29View card={card} size="lg" />
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Bidding Controls - Near User Profile */}
            {gameState.phase === 'bidding' && isMyTurn && (
                <div className="fixed bottom-44 md:bottom-56 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => makeBid('pass')}
                        className="w-14 h-14 bg-red-500/20 border-2 border-red-500/40 text-red-400 font-black rounded-full hover:bg-red-500/30 transition-all uppercase text-[10px] shadow-lg flex items-center justify-center italic"
                    >
                        Pass
                    </motion.button>

                    {/* Match Button (if someone bid) or Initial 16 */}
                    {!gameState.highestBid ? (
                        <motion.button
                            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => makeBid(16)}
                            className="w-16 h-16 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-black font-black rounded-full flex items-center justify-center text-xl"
                        >
                            16
                        </motion.button>
                    ) : gameState.highestBid.playerId !== user?.id && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => makeBid(gameState.highestBid!.amount)}
                            className="px-6 h-16 bg-cyan-500 text-black font-black rounded-full hover:scale-105 transition-all uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-center leading-tight"
                        >
                            MATCH<br />{gameState.highestBid.amount}
                        </motion.button>
                    )}

                    {/* Raise Options */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowBidSelector(!showBidSelector)}
                            className="w-14 h-14 bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400 font-extrabold rounded-full hover:bg-cyan-500/30 transition-all text-lg shadow-xl flex items-center justify-center"
                        >
                            {Math.max(16, (gameState.highestBid?.amount || 14) + 2)}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                const current = gameState.highestBid?.amount || 14
                                const nextPossible = current + 2
                                if (nextPossible <= 28) {
                                    makeBid(nextPossible)
                                } else {
                                    toast.error("Maximum bid is 28")
                                }
                            }}
                            className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center text-2xl border-2 border-white/20"
                        >
                            +
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Bid Number Selector Panel */}
            {showBidSelector && gameState.phase === 'bidding' && isMyTurn && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4" onClick={() => setShowBidSelector(false)}>
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1a1f2e] border border-cyan-500/30 p-6 rounded-t-[2.5rem] w-full max-w-md shadow-[0_-10px_80px_rgba(6,182,212,0.2)]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-white uppercase">Select Bid</h3>
                            <button
                                onClick={() => setShowBidSelector(false)}
                                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(num => {
                                const currentHigh = gameState.highestBid?.amount || 15
                                const isAvailable = num > currentHigh
                                if (!isAvailable) return null
                                return (
                                    <motion.button
                                        key={num}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            makeBid(num)
                                            setShowBidSelector(false)
                                        }}
                                        className="py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/20 transition-all"
                                    >
                                        {num}
                                    </motion.button>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Bain Phase Overlay - Only show to relevant players */}
            {
                gameState.bainPhase !== 'none' && (() => {
                    const isBidderTeam = match.players.findIndex(p => p.userId === gameState.bidWinner) % 2 === (mySeat % 2);
                    const shouldSeeDouble = gameState.bainPhase === 'double_chance' && !isBidderTeam;
                    const shouldSeeRedouble = gameState.bainPhase === 'redouble_chance' && isBidderTeam;

                    if (!shouldSeeDouble && !shouldSeeRedouble) return null;

                    return (
                        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#1a1f2e] border border-purple-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                            >
                                <h2 className="text-2xl font-black text-purple-400 mb-6 uppercase tracking-widest">
                                    {gameState.bainPhase === 'double_chance' ? 'CHALLENGE (DOUBLE)?' : 'DEFEND (REDOUBLE)?'}
                                </h2>
                                <div className="flex gap-4">
                                    <button onClick={() => handleBainAction('skip')} className="flex-1 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
                                        SKIP
                                    </button>
                                    <button
                                        onClick={() => handleBainAction(gameState.bainPhase === 'double_chance' ? 'double' : 'redouble')}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 font-black text-white hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-sm"
                                    >
                                        {gameState.bainPhase === 'double_chance' ? 'DOUBLE' : 'REDOUBLE'}
                                    </button>
                                </div>
                                <p className="mt-6 text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">
                                    {gameState.bainPhase === 'double_chance' ? 'Increase reward/penalty X2' : 'Increase reward/penalty X4'}
                                </p>
                            </motion.div>
                        </div>
                    )
                })()
            }

            {/* Trump Selection Overlay */}
            {
                gameState.phase === 'playing' && !gameState.trumpSuit && gameState.bidWinner === user?.id && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-[#1a1f2e] border border-cyan-500/30 p-8 rounded-3xl text-center max-w-md w-full">
                            <h2 className="text-2xl font-black mb-6 text-white">CHOOSE TRUMP</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {['H', 'D', 'C', 'S'].map(s => (
                                    <button key={s} onClick={() => handleTrumpSelect(s)} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-4xl hover:border-cyan-500 transition-all">
                                        {s === 'H' ? '♥️' : s === 'D' ? '♦️' : s === 'C' ? '♣️' : '♠️'}
                                    </button>
                                ))}
                            </div>
                            {/* Single Hand Mode Toggle - Only after 8 cards dealt */}
                            {gameState.secondDealComplete && myHand.length === 8 && (
                                <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                                    <div className="flex items-center justify-center gap-4 mb-2">
                                        <span className="text-sm font-bold text-white">PLAY SINGLE HAND?</span>
                                        <input
                                            type="checkbox"
                                            checked={gameState.singleHandMode || false}
                                            onChange={(e) => updateDoc(doc(db, 'matches', id!), { 'gameState.singleHandMode': e.target.checked })}
                                            className="w-6 h-6 accent-cyan-400 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-white/60 leading-relaxed">
                                        Only 1 trick • Highest rank wins • Trump doesn't matter
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Waiting for Trump Overlay */}
            {gameState.phase === 'playing' && !gameState.trumpSuit && gameState.bidWinner !== user?.id && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#1a1f2e]/90 border border-cyan-500/30 p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                    >
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Waiting for Trump</h2>
                        <p className="text-cyan-400/60 font-mono text-sm">
                            {match.players.find(p => p.userId === gameState.bidWinner)?.userName} is choosing...
                        </p>
                    </motion.div>
                </div>
            )}


            {/* Trump Card Indicator - Visible to everyone once chosen, with hidden sign */}
            {gameState.trumpSuit && gameState.phase === 'playing' && (
                (() => {
                    const ledSuit = gameState.currentTrick?.length > 0 ? gameState.currentTrick[0].card.suit : null;
                    const hasLedSuit = ledSuit ? myHand.some(c => c.suit === ledSuit) : true;
                    // Auto-pop logic: if it's my turn and I have no cards of the led suit
                    const canReveal = isMyTurn && !hasLedSuit && !gameState.trumpRevealed;

                    return (
                        <div className="fixed top-32 md:top-40 right-4 md:right-8 z-[45] flex flex-col items-center">
                            <div className="relative w-14 h-20 md:w-28 md:h-40 group">
                                <AnimatePresence mode="wait">
                                    {!gameState.trumpRevealed ? (
                                        <motion.div
                                            key="back"
                                            initial={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                                            animate={{
                                                rotateY: 0,
                                                opacity: 1,
                                                scale: canReveal ? [1, 1.15, 1] : 1,
                                                y: canReveal ? [0, -10, 0] : 0
                                            }}
                                            exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                                            transition={{
                                                rotateY: { duration: 0.5, ease: "circOut" },
                                                scale: canReveal ? { duration: 1, repeat: Infinity } : { duration: 0.5 },
                                                y: canReveal ? { duration: 1, repeat: Infinity } : { duration: 0.5 }
                                            }}
                                            onClick={() => canReveal && revealTrump()}
                                            className={`absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black border-2 rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5),0_0_15px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center transition-colors ${canReveal ? 'border-yellow-400 cursor-pointer shadow-[0_0_50px_rgba(250,204,21,0.3)]' : 'border-cyan-500/40 cursor-default'}`}
                                        >
                                            {/* High-tech card back pattern */}
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                            <div className="flex flex-col items-center">
                                                <div className="relative">
                                                    <Shield className={`w-8 h-8 md:w-16 md:h-16 ${canReveal ? 'text-yellow-400 animate-pulse' : 'text-cyan-500/30'}`} />
                                                    <div className="absolute inset-0 blur-xl bg-cyan-500/10" />
                                                </div>
                                                <span className={`text-[8px] md:text-[10px] font-black uppercase mt-2 md:mt-3 tracking-widest bg-black/40 px-2 py-0.5 rounded-full ${canReveal ? 'text-yellow-400' : 'text-cyan-400/80'}`}>
                                                    {canReveal ? 'Reveal!' : 'Trump'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="front"
                                            initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.5, ease: "circOut" }}
                                            className="absolute inset-0 bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.25)] border-4 border-yellow-500 flex flex-col items-center justify-center"
                                        >
                                            <div className={`text-5xl md:text-8xl leading-none ${gameState.trumpSuit === 'H' || gameState.trumpSuit === 'D' ? 'text-red-600' : 'text-black'}`}>
                                                {gameState.trumpSuit === 'H' ? '♥️' : gameState.trumpSuit === 'D' ? '♦️' : gameState.trumpSuit === 'C' ? '♣️' : '♠️'}
                                            </div>
                                            <div className="mt-2 md:mt-4 flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1 md:py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/30">
                                                <Eye className="w-2.5 h-2.5 md:w-4 md:h-4 text-yellow-600 animate-pulse" />
                                                <span className="text-[10px] md:text-sm font-black text-yellow-700 uppercase leading-none">Revealed</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Click prompt overlay for better UX */}
                            {canReveal && (
                                <p className="mt-2 text-[8px] md:text-[10px] text-yellow-400 font-black uppercase tracking-widest text-center animate-bounce">
                                    No Suit! Reveal?
                                </p>
                            )}
                        </div>
                    );
                })()
            )}


            {/* Round Winner Popup */}
            {
                gameState.showRoundPopup && gameState.roundWinner && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1a1f2e] border border-cyan-500/30 p-10 rounded-[3rem] w-full max-w-lg text-center shadow-[0_0_100px_rgba(6,182,212,0.2)]"
                        >
                            <div className="text-6xl mb-6">
                                {gameState.roundWinner.isDraw ? '🤝' : (gameState.roundWinner.bidWon ? '🎯' : '⚔️')}
                            </div>
                            <h2 className="text-4xl font-black mb-2 text-white italic tracking-tighter uppercase">
                                {gameState.roundWinner.isDraw ? 'ROUND DRAW!' : `Round ${gameState.round} Complete!`}
                            </h2>
                            <div className="text-cyan-400 font-mono mb-6 uppercase tracking-widest text-sm">
                                {gameState.roundWinner.isDraw ? 'Trump Not Revealed' : (gameState.roundWinner.bidWon ? 'Bid Successful!' : 'Bid Failed!')}
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 mb-6">
                                <div className="text-lg font-bold text-white mb-2">
                                    {gameState.roundWinner.isDraw ? 'No Points Awarded' : `Team ${gameState.roundWinner.team} Wins!`}
                                </div>
                                {!gameState.roundWinner.isDraw && (
                                    <div className="text-3xl font-black text-cyan-400">
                                        {gameState.roundWinner.points} Points
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
                                    <div className="text-xs text-cyan-400 mb-1">Your Team</div>
                                    <div className="text-2xl font-black text-white">{gameState.gamePoints?.team1 || 0}</div>
                                </div>
                                <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl">
                                    <div className="text-xs text-pink-400 mb-1">Opponents</div>
                                    <div className="text-2xl font-black text-white">{gameState.gamePoints?.team2 || 0}</div>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    await matchService.dismissRoundPopup(id!, gameState)
                                }}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm"
                            >
                                Next Round
                            </button>
                        </motion.div>
                    </div>
                )
            }
            {/* Set Victory Popup */}
            {
                gameState.showSetPopup && gameState.setWinner && (
                    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1a1f2e] border-2 border-yellow-500/50 p-12 rounded-[4rem] w-full max-w-xl text-center shadow-[0_0_150px_rgba(234,179,8,0.3)]"
                        >
                            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)]" />
                            <h2 className="text-5xl font-black mb-4 text-white italic tracking-tighter uppercase leading-tight">
                                SET VICTORY!<br />TEAM {gameState.setWinner.team} WINS
                            </h2>
                            <div className="text-yellow-500 font-mono mb-10 uppercase tracking-[0.2em] text-sm font-bold">
                                Total Set Domination
                            </div>

                            <div className="bg-white/5 rounded-[2rem] p-8 mb-10 border border-white/10">
                                <div className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Final Pips</div>
                                <div className="flex justify-around items-center">
                                    <div className="text-center">
                                        <div className="text-xs text-cyan-400 mb-2 uppercase font-black">Team 1</div>
                                        <div className={`text-4xl font-black ${gameState.setWinner.team === 1 ? 'text-white' : 'text-white/40'}`}>
                                            {Math.abs(gameState.gamePoints?.team1 || 0)}
                                        </div>
                                    </div>
                                    <div className="h-12 w-[2px] bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-xs text-pink-400 mb-2 uppercase font-black">Team 2</div>
                                        <div className={`text-4xl font-black ${gameState.setWinner.team === 2 ? 'text-white' : 'text-white/40'}`}>
                                            {Math.abs(gameState.gamePoints?.team2 || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    await matchService.dismissSetPopup(id!, gameState)
                                }}
                                className="w-full py-6 bg-yellow-500 text-black font-black rounded-3xl shadow-[0_10px_40px_rgba(234,179,8,0.3)] hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-[0.3em] text-lg"
                            >
                                OK - Next Set
                            </button>
                        </motion.div>
                    </div>
                )
            }
            {
                (gameState.phase === 'completed' || match.status === 'completed') && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1a1f2e] border border-cyan-500/30 p-10 rounded-[3rem] w-full max-w-lg text-center shadow-[0_0_100px_rgba(6,182,212,0.2)]"
                        >
                            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
                            <h2 className="text-4xl font-black mb-2 text-white italic tracking-tighter uppercase">
                                {((gameState.gamePoints?.team1 || 0) >= 6 || (gameState.gamePoints?.team2 || 0) <= -6) ? 'MATCH VICTORY' : 'MATCH OVER'}
                            </h2>
                            <div className="text-cyan-400 font-mono mb-8 uppercase tracking-widest text-xs">Final Set Results</div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className={`p-6 rounded-3xl border transition-all ${(gameState.gamePoints?.team1 || 0) >= 0
                                    ? 'bg-cyan-500/10 border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'
                                    : 'bg-red-500/10 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                                    }`}>
                                    <div className="text-[10px] font-black uppercase mb-1" style={{ color: (gameState.gamePoints?.team1 || 0) >= 0 ? '#06b6d4' : '#ef4444' }}>Your Team</div>
                                    <div className="text-4xl font-black text-white">{Math.abs(gameState.gamePoints?.team1 || 0)}</div>
                                    <div className="text-[10px] text-gray-500 mt-2">{(gameState.gamePoints?.team1 || 0) >= 0 ? 'RED PIPS (WON)' : 'BLACK PIPS (LOST)'}</div>
                                </div>
                                <div className={`p-6 rounded-3xl border transition-all ${(gameState.gamePoints?.team2 || 0) >= 0
                                    ? 'bg-pink-500/10 border-pink-500/20 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]'
                                    : 'bg-red-500/10 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                                    }`}>
                                    <div className="text-[10px] font-black uppercase mb-1" style={{ color: (gameState.gamePoints?.team2 || 0) >= 0 ? '#ec4899' : '#ef4444' }}>Opponents</div>
                                    <div className="text-4xl font-black text-white">{Math.abs(gameState.gamePoints?.team2 || 0)}</div>
                                    <div className="text-[10px] text-gray-500 mt-2">{(gameState.gamePoints?.team2 || 0) >= 0 ? 'RED PIPS (WON)' : 'BLACK PIPS (LOST)'}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/play')}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm"
                            >
                                Return To Lobby
                            </button>
                        </motion.div>
                    </div>
                )
            }

            {/* Timeout Prompt */}
            {
                timeoutOccurred && (
                    <MatchExitPopup
                        title="Time Expired!"
                        message="A player took too long to move. The game has been paused."
                        onBack={() => navigate('/play')}
                        onNew={() => navigate('/play/create')}
                    />
                )
            }

            {/* Player Left Prompt */}
            {
                playerLeftName && (
                    <MatchExitPopup
                        title="Player Left!"
                        message={`${playerLeftName} has left the match. You can start a new game or return to the lobby.`}
                        onBack={() => navigate('/play')}
                        onNew={() => navigate('/play/create')}
                    />
                )
            }
            {
                gameState.lastTrickCards && gameState.lastTrickCards.length > 0 && showHistory && (
                    <div className="fixed left-20 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[#1a1f2e]/95 backdrop-blur-xl p-4 rounded-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 min-w-[180px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Previous Trick</span>
                            <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white transition-colors">×</button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {gameState.lastTrickCards.slice(-4).map((h, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                    <div className="scale-[0.6] -m-3"><Card29View card={h.card} size="sm" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/90 leading-tight">{h.playerName?.split(' ')[0]}</span>
                                        <span className="text-[8px] font-bold text-cyan-400/60 uppercase">Played</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    )
}

const MatchExitPopup = ({ title, message, onBack, onNew }: { title: string, message: string, onBack: () => void, onNew: () => void }) => (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1f2e] border border-cyan-500/30 p-8 md:p-12 rounded-[3.5rem] w-full max-w-md text-center shadow-[0_0_100px_rgba(6,182,212,0.3)]"
        >
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-black mb-2 text-white italic tracking-tighter uppercase">{title}</h2>
            <p className="text-gray-400 mb-10 text-sm leading-relaxed">{message}</p>

            <div className="flex flex-col gap-4">
                <button
                    onClick={onNew}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm"
                >
                    Start New Game
                </button>
                <button
                    onClick={onBack}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                >
                    Back to Lobby
                </button>
            </div>
        </motion.div>
    </div>
)

export default Card29Game
