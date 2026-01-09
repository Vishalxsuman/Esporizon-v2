import { MatchPlayer } from '@/types/match'
import { useEffect, useState } from 'react'

interface PlayerSeatProps {
    player: MatchPlayer
    isActive: boolean
    isCurrentUser: boolean
    tricksWon: number
    position: 'bottom' | 'left' | 'top' | 'right'
    playerNumber: number
    turnStartedAt?: any
    turnDuration?: number
    currentBid?: number | 'pass' | null
    gamePhase?: 'bidding' | 'playing' | 'completed'
}

export const PlayerSeat = ({ player, isActive, tricksWon, position, turnStartedAt, turnDuration = 30, currentBid, gamePhase }: PlayerSeatProps) => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isActive || !turnStartedAt || typeof turnStartedAt.toMillis !== 'function') {
            setProgress(0)
            return
        }

        const interval = setInterval(() => {
            const elapsed = (Date.now() - turnStartedAt.toMillis()) / 1000
            const prog = Math.min((elapsed / turnDuration) * 100, 100)
            setProgress(prog)
        }, 100)

        return () => clearInterval(interval)
    }, [isActive, turnStartedAt, turnDuration])

    const positionClasses = {
        bottom: 'absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 scale-100',
        left: 'absolute left-8 md:left-20 top-1/2 -translate-y-1/2 scale-100',
        top: 'absolute top-14 md:top-16 left-1/2 -translate-x-1/2 scale-100',
        right: 'absolute right-8 md:right-20 top-1/2 -translate-y-1/2 scale-100'
    }

    return (
        <div className={`${positionClasses[position]} z-20`}>
            <div className="flex flex-col items-center gap-1">
                {/* Avatar with Circular Timer */}
                <div className="relative">
                    {/* Active Glow Ring */}
                    {isActive && (
                        <div className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
                    )}

                    {/* Timer Circle - Only during playing phase */}
                    {isActive && gamePhase === 'playing' && turnStartedAt && (
                        <svg className="absolute -inset-2 w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="47"
                                fill="none"
                                stroke="rgba(6, 182, 212, 0.1)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="47"
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 47}`}
                                strokeDashoffset={`${2 * Math.PI * 47 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                            />
                        </svg>
                    )}

                    {/* Profile Picture */}
                    <div className={`w-16 h-16 rounded-full border-4 relative overflow-hidden ${isActive ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'border-[#1a3a52]'
                        } bg-[#0f2537]`}>
                        <img
                            src={player.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.userId}`}
                            alt={player.userName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>

                    {/* Current Bid Badge - Left side during bidding */}
                    {gamePhase === 'bidding' && currentBid && (
                        <div className="absolute -top-1 -left-1 bg-cyan-500 rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-black text-white border-2 border-[#0a1628] shadow-lg">
                            {currentBid === 'pass' ? 'P' : currentBid}
                        </div>
                    )}

                    {/* Tricks Won Badge */}
                    {tricksWon > 0 && gamePhase === 'playing' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black text-black border-2 border-[#0a1628] shadow-lg">
                            {tricksWon}
                        </div>
                    )}
                </div>

                {/* Bot Label (Optional) */}
                {player.isBot && (
                    <span className="text-[10px] text-white/50 font-bold uppercase">Bot</span>
                )}
            </div>
        </div>
    )
}
