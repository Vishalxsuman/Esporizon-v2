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
                {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default SocialFeed
