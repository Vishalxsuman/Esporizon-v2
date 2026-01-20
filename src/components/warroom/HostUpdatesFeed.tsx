import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { feedService, Post } from '@/services/FeedService'
import PostCard from '@/components/warroom/PostCard'

const HostUpdatesFeed = () => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        setLoading(true)
        const data = await feedService.getPosts('host_update')
        setPosts(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 animate-pulse">
                    Loading Updates...
                </p>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="mt-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center rounded-2xl bg-[#141414]/40 border border-dashed border-teal-500/20"
                >
                    <Megaphone className="w-12 h-12 text-teal-500/40 mx-auto mb-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-teal-500/60">No Host Updates</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                        Verified hosts will post updates here
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-6 pb-20">
            <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default HostUpdatesFeed
