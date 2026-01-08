import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, User as UserIcon, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { postService } from '@/services/PostService'
import { Post } from '@/types/Post'
import toast from 'react-hot-toast'

interface SocialFeedProps {
    daysAgo?: number
    maxPosts?: number
}

const SocialFeed = ({ daysAgo = 0, maxPosts = 10 }: SocialFeedProps) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [processingAction, setProcessingAction] = useState<string | null>(null)
    const { user } = useAuth()

    useEffect(() => {
        setLoading(true)
        const unsubscribe = postService.subscribeToPostsByRange(daysAgo, maxPosts, (newPosts) => {
            setPosts(newPosts)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [daysAgo, maxPosts])

    const handleLike = async (postId: string) => {
        if (!user) {
            toast.error('Tactical Override: Sign in to engage')
            return
        }
        const actionKey = `${postId}-like`
        if (processingAction === actionKey) return
        setProcessingAction(actionKey)
        try {
            // Determine current like status from the posts array state (optimistic or current)
            const post = posts.find(p => p.id === postId)
            const isLiked = post?.likes?.includes(user.id) || false
            await postService.toggleLikeStatus(postId, user.id, isLiked)
        } catch (error) {
            toast.error('Signal Interference: Failed to update like')
        } finally {
            setProcessingAction(null)
        }
    }

    const formatTimeAgo = (timestamp: string) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)

        if (diffMins < 1) return 'Active Now'
        if (diffMins < 60) return `${diffMins}m`
        if (diffHours < 24) return `${diffHours}h`
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-[var(--accent)]/10 border-t-[var(--accent)] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] animate-pulse">Synchronizing Data...</p>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl"
            >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <ShieldCheck className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Zero Activity Detected</h3>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter mt-1">Be the first to transmit a signal to the network</p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6">
            <AnimatePresence mode="popLayout">
                {posts.map((post, index) => {
                    const isLiked = user ? post.likes?.includes(user.id) : false

                    return (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group relative bg-[#18181b] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00ffc2]/30 transition-all duration-500 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 flex items-center justify-between">
                                <Link to={`/profile/${post.userId}`} className="flex items-center gap-4 group/user">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ffc2] to-[#7c3aed] p-[1px] shadow-[0_0_20px_rgba(0,255,194,0.1)] group-hover/user:shadow-[0_0_30px_rgba(0,255,194,0.3)] transition-all duration-500">
                                            <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center overflow-hidden">
                                                {post.userAvatar ? (
                                                    <img src={post.userAvatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00ffc2] rounded-full border-2 border-[#18181b] flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-[#09090b] rounded-full animate-ping"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-white group-hover/user:text-[#00ffc2] transition-colors">@{post.userName}</h3>
                                            <div className="p-0.5 bg-[#00ffc2]/10 rounded-md border border-[#00ffc2]/20">
                                                <ShieldCheck size={10} className="text-[#00ffc2]" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{formatTimeAgo(post.createdAt)}</p>
                                    </div>
                                </Link>
                                <button className="p-3 text-gray-600 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-8 pb-4">
                                <p className="text-sm leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Image Overlay Effect */}
                            {post.imageUrl && (
                                <div className="px-6 mb-4">
                                    <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors bg-black/40 aspect-video">
                                        <img
                                            src={post.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/40 to-transparent" />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-2.5 group/btn ${isLiked ? 'text-[#ff4b2b]' : 'text-gray-500 hover:text-white'} transition-colors duration-300`}
                                    >
                                        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${isLiked ? 'bg-[#ff4b2b]/10 border-[#ff4b2b]/30' : 'bg-white/5 border-white/5 group-hover/btn:border-white/10 group-hover/btn:bg-white/10'}`}>
                                            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                        </div>
                                        <span className="text-xs font-black italic tracking-widest">{post.likes?.length || 0}</span>
                                    </motion.button>

                                    <div className="flex items-center gap-2.5 group/btn text-gray-500 hover:text-white transition-colors duration-300 cursor-pointer">
                                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover/btn:border-white/10 group-hover/btn:bg-white/10 transition-all duration-300">
                                            <MessageCircle size={18} />
                                        </div>
                                        <span className="text-xs font-black italic tracking-widest">{post.comments?.length || 0}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 text-gray-600 hover:text-[#00ffc2] hover:bg-[#00ffc2]/5 rounded-2xl border border-transparent hover:border-[#00ffc2]/20 transition-all"
                                >
                                    <Share2 size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export default SocialFeed
