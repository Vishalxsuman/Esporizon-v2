import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { postService } from '@/services/PostService'
import { warRoomService } from '@/services/WarRoomService'
import { Post } from '@/types/Post'
import { TournamentCard as TournamentCardType } from '@/types/WarRoomTypes'
import PostCard from '@/components/PostCard'
import TournamentCard from './TournamentCard'
import { Loader2 } from 'lucide-react'

const GlobalFeed = () => {
    const [posts, setPosts] = useState<Post[]>([])
    const [tournamentCards, setTournamentCards] = useState<TournamentCardType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)

        // Subscribe to regular posts
        const unsubPosts = postService.subscribePublicPosts(10, (newPosts) => {
            setPosts(newPosts)
        })

        // Subscribe to tournament cards
        const unsubTournaments = warRoomService.subscribeToTournamentCards((cards) => {
            setTournamentCards(cards)
            setLoading(false)
        })

        return () => {
            unsubPosts()
            unsubTournaments()
        }
    }, [])

    // Merge and sort by priority/recency
    const mergedFeed = [
        ...tournamentCards.map(card => ({ type: 'tournament', data: card, createdAt: card.createdAt })),
        ...posts.map(post => ({ type: 'post', data: post, createdAt: post.createdAt }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff88] animate-pulse">
                    Loading Intel...
                </p>
            </div>
        )
    }

    if (mergedFeed.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-2xl bg-[#141414]/40 border border-dashed border-[#00ff88]/20 backdrop-blur-3xl overflow-hidden relative mt-6"
            >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,255,136,0.02)_10px,rgba(0,255,136,0.02)_20px)] pointer-events-none" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff88]/60">War Room Silent</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                    No active coordination • Stand by
                </p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6 mt-6">
            <AnimatePresence mode="popLayout">
                {mergedFeed.map((item, index) => (
                    <motion.div
                        key={item.type === 'tournament' ? (item.data as TournamentCardType).id : (item.data as Post).id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {item.type === 'tournament' ? (
                            <TournamentCard card={item.data as TournamentCardType} />
                        ) : (
                            <PostCard post={item.data as Post} index={index} />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default GlobalFeed
