import { GameState } from '@/types/match'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface GameHeaderProps {
    gameState: GameState
    mySeat: number
    team1RoundPoints: number
    team2RoundPoints: number
}

export const GameHeader = ({ gameState, mySeat, team1RoundPoints, team2RoundPoints }: GameHeaderProps) => {
    const navigate = useNavigate()

    // Logic to determine "My Team" vs "Opponent Team"
    // Team 1: Players 0 & 2
    // Team 2: Players 1 & 3
    const amITeam1 = mySeat === 0 || mySeat === 2 || mySeat === -1
    const myScore = amITeam1 ? team1RoundPoints : team2RoundPoints
    const oppScore = amITeam1 ? team2RoundPoints : team1RoundPoints

    const targetBid = (gameState.highestBid?.amount || 16) + (gameState.bidAdjustment || 0)
    const currentTrickCount = Object.keys(gameState.tricks || {}).length

    // Trump Icon Helper
    const getTrumpIcon = (suit: string | null) => {
        if (!suit) return <Shield className="w-3 h-3 text-white/20" />
        switch (suit) {
            case 'H': return <span className="text-red-500 text-base leading-none">♥️</span>
            case 'D': return <span className="text-red-500 text-base leading-none">♦️</span>
            case 'C': return <span className="text-white text-base leading-none">♣️</span>
            case 'S': return <span className="text-white text-base leading-none">♠️</span>
            default: return <Shield className="w-3 h-3 text-white/20" />
        }
    }

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-lg">
            {/* Main Glass Container */}
            <div className="relative bg-[#0a1628]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">

                {/* Top Info Bar */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-transparent via-white/5 to-transparent border-b border-white/5">

                    {/* Back Button & Round */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-white" />
                        </button>
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">R-{gameState.round || 1}</span>
                    </div>

                    {/* Tricks Progress */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">TRICKS</span>
                        <div className="h-3 w-[1px] bg-white/10 mx-1" />
                        <span className="text-[10px] font-black text-cyan-400 font-mono tracking-widest">
                            {currentTrickCount}<span className="text-white/30 mx-0.5">/</span>8
                        </span>
                    </div>

                    {/* Phase */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">PHASE</span>
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                            {gameState.phase === 'bidding' ? 'BID' : gameState.phase === 'playing' ? 'PLAY' : 'END'}
                        </span>
                    </div>
                </div>

                {/* Main HUD Content */}
                <div className="relative px-4 py-2 pb-3">
                    <div className="flex items-center justify-between relative z-10">
                        {/* YOU Section */}
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">YOU</span>
                            <motion.div
                                key={myScore}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            >
                                {myScore}
                            </motion.div>
                        </div>

                        {/* Center: Trump/Bid */}
                        <div className="flex flex-col items-center justify-center flex-[1.2] relative px-2">
                            {/* Divider Gradients */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                            <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="text-[9px] text-white/80 font-bold tracking-wide">Trump</span>
                                    {getTrumpIcon(gameState.trumpRevealed ? gameState.trumpSuit : null)}
                                </div>

                                <motion.div
                                    className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] leading-none"
                                >
                                    {targetBid}
                                </motion.div>
                            </div>
                        </div>

                        {/* OPPONENT Section */}
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">OPP</span>
                            <motion.div
                                key={oppScore}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            >
                                {oppScore}
                            </motion.div>
                        </div>
                    </div>

                    {/* Ambient Background Glows */}
                    <div className="absolute top-1/2 left-8 -translate-y-1/2 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 w-24 h-24 bg-red-500/10 blur-[40px] rounded-full pointer-events-none" />
                </div>

                {/* Bottom Progress/Status Line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/80 via-yellow-400/80 to-red-500/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
        </div>
    )
}
