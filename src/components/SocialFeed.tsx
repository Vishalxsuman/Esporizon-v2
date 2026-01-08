import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { postService } from '@/services/PostService'
import { Post } from '@/types/Post'
import PostCard from './PostCard'

interface SocialFeedProps {
    daysAgo?: number
    maxPosts?: number
}

const SocialFeed = ({ daysAgo = 0, maxPosts = 10 }: SocialFeedProps) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        const unsubscribe = postService.subscribeToPostsByRange(daysAgo, maxPosts, (newPosts) => {
            setPosts(newPosts)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [daysAgo, maxPosts])

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
                className="p-12 text-center rounded-[2rem] bg-black/40 border border-dashed border-[var(--accent)]/20 backdrop-blur-3xl overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,255,194,0.02)_10px,rgba(0,255,194,0.02)_20px)] pointer-events-none" />
                <div className="w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--accent)]/20 shadow-[0_0_15px_rgba(0,255,194,0.05)]">
                    <ShieldCheck className="w-7 h-7 text-[var(--accent)]/40" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent)]/60">Uplink Silent</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">Fragment_ID: Zero_Detected</p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6">
            <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default SocialFeed
