import { useState, forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, User as UserIcon, MoreHorizontal, Lock, X } from 'lucide-react'
import { postService } from '@/services/PostService'
import { Post } from '@/types/Post'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import CommentSection from './CommentSection'

interface PostCardProps {
    post: Post
    index: number
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(({ post, index }, ref) => {
    const [showComments, setShowComments] = useState(false)
    const [processingLike, setProcessingLike] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { user } = useAuth()

    const isLiked = user ? post.likes?.includes(user.id) : false
    const isOwner = user?.id === post.userId

    const handleLike = async () => {
        if (!user) {
            toast.error('Sign in to like')
            return
        }
        if (processingLike) return
        setProcessingLike(true)
        try {
            await postService.toggleLike(post.id, user.id)
        } catch (error) {
            toast.error('Failed to update like')
        } finally {
            setProcessingLike(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await postService.deletePost(post.id)
            toast.success('Post Deleted')
            setShowDeleteConfirm(false)
        } catch (error) {
            toast.error('Failed to delete post')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleShare = async () => {
        await postService.sharePost(post)
        toast.success('Link Copied')
    }

    const formatTimeAgo = (timestamp: string) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)

        if (diffMins < 1) return 'Just Now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.4, delay: index * 0.03, ease: "circOut" }}
            className="group relative bg-black/40 backdrop-blur-3xl border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-500 shadow-xl"
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between relative z-10">
                <Link to={`/profile/${post.userId}`} className="flex items-center gap-4 group/user">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-[var(--accent)]/10 p-[1px] border border-[var(--border)] group-hover/user:border-[var(--accent)]/40 transition-all shadow-lg">
                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center overflow-hidden">
                                {post.userAvatar ? (
                                    <img src={post.userAvatar} alt="" className="w-full h-full object-cover group-hover/user:scale-110 transition-all duration-700" />
                                ) : (
                                    <UserIcon className="w-5 h-5 text-[var(--accent)]/50" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] group-hover/user:text-[var(--accent)] transition-colors">@{post.userName}</h3>
                            {post.visibility === 'private' ? (
                                <Lock size={10} className="text-white" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/40" />
                            )}
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-0.5">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-3 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                            title="Delete Post"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mb-4 border border-red-500/30">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest mb-2 italic text-red-500">Delete Post?</h3>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mb-8 max-w-xs">This action cannot be undone. Are you sure?</p>
                        <div className="flex gap-4 w-full max-w-xs">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                {isDeleting ? 'DELETING...' : 'DELETE'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="px-8 pb-6 relative z-10">
                <p className="text-sm leading-relaxed text-[var(--text-primary)] font-medium whitespace-pre-wrap tracking-tight">{post.content}</p>
            </div>

            {/* Media */}
            {post.imageUrl && (
                <div className="px-6 mb-6">
                    <div className="relative rounded-[1.5rem] overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all bg-black/40 aspect-video shadow-2xl">
                        <img
                            src={post.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-8 py-5 bg-[var(--accent)]/5 border-t border-[var(--border)] flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        disabled={processingLike}
                        className={`flex items-center gap-3 transition-all duration-300 ${isLiked ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        <Heart size={18} className={isLiked ? 'fill-current shadow-[0_0_15px_var(--accent)]' : ''} />
                        <span className="text-[10px] font-black tracking-widest">{post.likeCount ?? post.likes?.length ?? 0}</span>
                    </motion.button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-3 transition-all duration-300 ${showComments ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        <MessageCircle size={18} className={showComments ? 'shadow-[0_0_15px_var(--accent)]' : ''} />
                        <span className="text-[10px] font-black tracking-widest">{post.commentCount ?? 0}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                        title="Share"
                    >
                        <Share2 size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`w-1 h-3 rounded-full ${i <= (post.likes?.length || 0) % 4 ? 'bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]/40">Verified</span>
                </div>
            </div>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/40 border-t border-[var(--border)]"
                    >
                        <CommentSection postId={post.id} onClose={() => setShowComments(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
})

PostCard.displayName = 'PostCard'

export default PostCard
