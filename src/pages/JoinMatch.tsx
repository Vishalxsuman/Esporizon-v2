import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { matchService } from '@/services/MatchService'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const JoinMatch = () => {
    const { code } = useParams<{ code: string }>()
    const { user } = useUser()
    const navigate = useNavigate()
    const [status, setStatus] = useState('Checking invite code...')

    useEffect(() => {
        if (!code || !user) return

        const performJoin = async () => {
            try {
                setStatus('Locating room...')
                const match = await matchService.getMatchByInviteCode(code)

                if (!match) {
                    toast.error('Invalid or expired room code')
                    navigate('/play')
                    return
                }

                // Check if user is already in the match
                const isAlreadyJoined = match.players.some(p => p.userId === user.id)
                if (isAlreadyJoined) {
                    navigate(`/play/match/${match.id}`)
                    return
                }

                // Attempt to join
                setStatus('Joining room...')
                await matchService.joinMatch({
                    matchId: match.id,
                    userId: user.id,
                    userName: user.fullName || user.username || 'Anonymous',
                    userAvatar: user.imageUrl
                })

                toast.success('Joined successfully!')
                navigate(`/play/match/${match.id}`)
            } catch (error: any) {
                console.error('Join error:', error)
                toast.error(error.message || 'Failed to join match')
                navigate('/play')
            }
        }

        performJoin()
    }, [code, user, navigate])

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        🃏
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">{status}</h2>
                <p className="text-[var(--text-secondary)]">Please wait while we set up your seat...</p>
            </motion.div>
        </div>
    )
}

export default JoinMatch
