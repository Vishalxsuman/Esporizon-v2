import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Gamepad2, AlignLeft, Target, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { UserProfile } from '@/types'
import { userService } from '@/services/UserService'
import toast from 'react-hot-toast'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    user: any | null
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, user }) => {
    const [displayName, setDisplayName] = useState(user?.fullName || user?.displayName || '')
    const [username, setUsername] = useState(profile?.username || '')
    const [bio, setBio] = useState(profile?.bio || '')
    const [gameAccounts, setGameAccounts] = useState(profile?.gameAccounts || {})
    const [loading, setLoading] = useState(false)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'idle'>('idle')

    // Simplified username availability check with timer-based debounce
    useEffect(() => {
        if (!username || username === profile?.username) {
            setUsernameStatus(username === profile?.username ? 'available' : 'idle')
            setCheckingUsername(false)
            return
        }

        setCheckingUsername(true)
        const timer = setTimeout(async () => {
            if (username.length < 3) {
                setUsernameStatus('invalid')
                setCheckingUsername(false)
                return
            }

            try {
                // Simulated availability check
                setUsernameStatus('available')
            } catch (err) {
                console.error(err)
            } finally {
                setCheckingUsername(false)
            }
        }, 800)

        return () => clearTimeout(timer)
    }, [username, profile])

    const handleSave = async () => {
        const userId = user?.id || user?.uid
        if (!userId) return
        if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
            toast.error('Identification Error: Username unavailable')
            return
        }

        setLoading(true)

        try {
            await userService.updateProfile(userId, {
                username: username.toLowerCase().trim(),
                bio,
                gameAccounts
            })

            toast.success('Operational Profile Updated')
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Logistical Failure during Update')
        } finally {
            setLoading(false)
        }
    }

    const updateGameId = (game: keyof UserProfile['gameAccounts'], id: string) => {
        setGameAccounts(prev => ({ ...prev, [game]: id }))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] italic">Edit Combat Profile</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                                        <User size={12} /> Call Sign (Display Name)
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-[#00ffc2]/50 focus:outline-none transition-all mb-2"
                                        placeholder="Enter display name..."
                                    />

                                    <div className="space-y-2 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                                            <Target size={12} className="text-[#00ffc2]" /> Agent Identity @Username
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                className={`w-full bg-black/40 border rounded-2xl p-4 pr-12 text-sm font-bold focus:outline-none transition-all ${usernameStatus === 'taken' ? 'border-red-500/50' :
                                                    usernameStatus === 'available' ? 'border-[#00ffc2]/30' : 'border-white/5'
                                                    }`}
                                                placeholder="choose_unique_tag"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {checkingUsername ? (
                                                    <Loader2 className="w-4 h-4 text-[#00ffc2] animate-spin" />
                                                ) : usernameStatus === 'available' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-[#00ffc2]" />
                                                ) : usernameStatus === 'taken' ? (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                ) : null}
                                            </div>
                                        </div>
                                        <p className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${usernameStatus === 'taken' ? 'text-red-500' :
                                            usernameStatus === 'available' ? 'text-[#00ffc2]' : 'text-gray-600'
                                            }`}>
                                            {checkingUsername ? 'Scanning network...' :
                                                usernameStatus === 'taken' ? 'Signal collision: ID already claimed' :
                                                    usernameStatus === 'available' ? 'ID verified: Uplink available' :
                                                        'Min 3 chars, letters, numbers, underscore'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                                        <AlignLeft size={12} /> Combat Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:border-[#00ffc2]/50 focus:outline-none transition-all h-24 resize-none"
                                        placeholder="Tell them about your skills..."
                                    />
                                </div>
                            </div>

                            {/* Game IDs */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#00ffc2] ml-1 flex items-center gap-2">
                                    <Gamepad2 size={12} /> Tactical IDs
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['BGMI', 'Free Fire', 'Valorant', 'Minecraft'].map((game) => {
                                        const key = game.toLowerCase().replace(' ', '') as keyof UserProfile['gameAccounts']
                                        return (
                                            <div key={game} className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">{game}</label>
                                                <input
                                                    type="text"
                                                    value={gameAccounts[key] || ''}
                                                    onChange={(e) => updateGameId(key, e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold focus:border-[#00ffc2]/30 focus:outline-none transition-all"
                                                    placeholder={`Enter ${game} ID`}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || checkingUsername || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                                className="flex-[2] px-6 py-4 bg-[#00ffc2] text-[#09090b] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-[#09090b]/20 border-t-[#09090b] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={16} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default EditProfileModal
