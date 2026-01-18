import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Clock, Info, Shield, Server, Map as MapIcon, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { RoomDetails } from '@/types/tournament'

interface RoomDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    roomDetails: RoomDetails | null
    tournamentName: string
    startTime: Date
}

const RoomDetailsModal = ({ isOpen, onClose, roomDetails, tournamentName, startTime }: RoomDetailsModalProps) => {
    const [copied, setCopied] = useState<{ [key: string]: boolean }>({})
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const target = new Date(startTime).getTime()
            const diff = target - now

            if (diff <= 0) {
                setTimeRemaining('Match Started!')
                clearInterval(interval)
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeRemaining(`${minutes}m ${seconds}s`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopied({ ...copied, [field]: true })
        setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
    }

    if (!roomDetails) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/5 p-6">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic">ROOM DETAILS</h2>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        {tournamentName}
                                    </p>
                                </div>
                            </div>

                            {/* Countdown */}
                            <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-zinc-900/60 rounded-xl border border-white/5">
                                <Clock className="w-5 h-5 text-teal-400 animate-pulse" />
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                        Time to Match Start
                                    </p>
                                    <p className="text-xl font-black text-teal-400 italic">{timeRemaining}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Warning Banner */}
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-yellow-500 uppercase tracking-wide mb-1">
                                            Important
                                        </p>
                                        <p className="text-xs text-yellow-200/80 font-medium leading-relaxed">
                                            Join the room 5 minutes before match start. Do not share these credentials with anyone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Room ID */}
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                    Room ID
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl">
                                        <p className="text-2xl font-black text-white italic tracking-wider">
                                            {roomDetails.roomId}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(roomDetails.roomId, 'roomId')}
                                        className="w-12 h-12 rounded-xl bg-teal-500 hover:bg-teal-400 transition-colors flex items-center justify-center shadow-lg"
                                    >
                                        {copied.roomId ? (
                                            <Check className="w-5 h-5 text-black" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-black" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                    Password
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl">
                                        <p className="text-2xl font-black text-white italic tracking-wider">
                                            {roomDetails.password}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(roomDetails.password, 'password')}
                                        className="w-12 h-12 rounded-xl bg-teal-500 hover:bg-teal-400 transition-colors flex items-center justify-center shadow-lg"
                                    >
                                        {copied.password ? (
                                            <Check className="w-5 h-5 text-black" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-black" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Server & Map Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Server className="w-3 h-3" />
                                        Server
                                    </label>
                                    <div className="px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl">
                                        <p className="font-bold text-white">{roomDetails.server}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MapIcon className="w-3 h-3" />
                                        Map
                                    </label>
                                    <div className="px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl">
                                        <p className="font-bold text-white">{roomDetails.map}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {roomDetails.specialInstructions && (
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                        Special Instructions
                                    </label>
                                    <div className="px-4 py-3 bg-teal-500/5 border border-teal-500/20 rounded-xl">
                                        <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                                            {roomDetails.specialInstructions}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Join Instructions */}
                            <div className="bg-zinc-800/30 rounded-xl p-4">
                                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                                    How to Join
                                </h3>
                                <ol className="space-y-2 text-xs text-zinc-400 font-medium">
                                    <li className="flex items-start gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-black">
                                            1
                                        </span>
                                        <span>Open the game and navigate to Custom Room</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-black">
                                            2
                                        </span>
                                        <span>Enter the Room ID and Password shown above</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-black">
                                            3
                                        </span>
                                        <span>Wait for the host to start the match</span>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/5 p-6">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default RoomDetailsModal
