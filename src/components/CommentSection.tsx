import { useState, useEffect } from 'react'
import { Send, User as UserIcon, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { postService } from '@/services/PostService'
import { Comment } from '@/types/Post'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface CommentSectionProps {
    postId: string
    onClose: () => void
}

const CommentSection = ({ postId, onClose }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        setIsLoading(true)
        const unsubscribe = postService.subscribeToComments(postId, (items) => {
            setComments(items)
            setIsLoading(false)
        })
        return () => unsubscribe()
    }, [postId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error('Tactical Error: Authorization Required')
            return
        }
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            await postService.addComment(
                postId,
                user.id,
                user.displayName || 'Anonymous',
                newComment.trim(),
                user.photoURL || ''
            )
            setNewComment('')
        } catch (error) {
            toast.error('Signal Error: Failed to drop intel')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col max-h-[400px]"
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tactical Comm Log</h4>
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-[#00ffc2] animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Silence on the network...</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ffc2]/20 to-[#7c3aed]/20 p-[1px] shrink-0">
                                <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center overflow-hidden">
                                    {comment.userAvatar ? (
                                        <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-3 h-3 text-gray-600" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-[#00ffc2] uppercase tracking-tighter">@{comment.userName}</span>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Input intel..."
                    className="flex-1 bg-[#09090b] border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00ffc2]/50 transition-colors"
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="p-2 bg-[#00ffc2] text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>
        </motion.div>
    )
}

export default CommentSection
