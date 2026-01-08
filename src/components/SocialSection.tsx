import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { postService } from '@/services/PostService'
import { Post } from '@/types/Post'
import CreatePostCard from './CreatePostCard'
import PostCard from './PostCard'

const SocialSection = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')
    const [allPosts, setAllPosts] = useState<Post[]>([])
    const [myPosts, setMyPosts] = useState<Post[]>([])
    const [loadingAll, setLoadingAll] = useState(true)
    const [loadingMy, setLoadingMy] = useState(true)

    useEffect(() => {
        setLoadingAll(true)
        const unsubscribeAll = postService.subscribePublicPosts(20, (posts) => {
            setAllPosts(posts)
            setLoadingAll(false)
        })
        return () => unsubscribeAll()
    }, [])

    useEffect(() => {
        if (!user) return
        setLoadingMy(true)
        const unsubscribeMy = postService.subscribeUserPosts(user.id, 20, (posts) => {
            setMyPosts(posts)
            setLoadingMy(false)
        })
        return () => unsubscribeMy()
    }, [user])

    const PostList = ({ posts, loading, emptyMessage }: { posts: Post[], loading: boolean, emptyMessage: string }) => {
        if (loading) {
            return (
                <div className="space-y-6">
                    {[1, 2].map((n) => (
                        <div key={n} className="bg-[var(--glass)] border border-[var(--border)] rounded-[2rem] h-48 animate-pulse shadow-xl" />
                    ))}
                </div>
            )
        }

        if (posts.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 px-8 text-center rounded-[2rem] bg-black/40 border border-dashed border-[var(--border)] overflow-hidden relative shadow-2xl"
                >
                    <div className="w-14 h-14 bg-[var(--accent)]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--accent)]/10">
                        <Globe className="w-6 h-6 text-[var(--accent)]/30" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">No Posts Yet</h3>
                    <p className="text-[10px] text-[var(--text-secondary)]/50 font-bold uppercase tracking-widest mt-2">{emptyMessage}</p>
                </motion.div>
            )
        }

        return (
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {posts.map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} />
                    ))}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto px-4 pb-20 relative">
            {/* Transmission Console */}
            <div className="mb-12 relative group">
                <div className="absolute -left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--accent)]/40 to-transparent" />
                <CreatePostCard />
                <div className="absolute -right-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--accent)]/40 to-transparent" />
            </div>

            {/* Tactical Command Toggles */}
            <div className="space-y-10">
                <div className="relative p-1 bg-black/60 rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden group">
                    {/* Console HUD Details */}
                    <div className="absolute top-0 right-0 w-16 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,255,194,0.03)_5px,rgba(0,255,194,0.03)_10px)] pointer-events-none" />

                    <div className="flex relative z-10">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl transition-all duration-500 relative ${activeTab === 'all'
                                ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_25px_rgba(0,255,194,0.4)]'
                                : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Globe size={14} className={activeTab === 'all' ? 'animate-pulse' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Feed</span>
                            </div>
                            {activeTab === 'all' && (
                                <motion.div layoutId="tab-glow" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[var(--bg-primary)] rounded-full" />
                            )}
                        </button>

                        <div className="w-[1px] bg-[var(--border)] my-3 mx-1" />

                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-xl transition-all duration-500 relative ${activeTab === 'mine'
                                ? 'bg-white text-[var(--bg-primary)] shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                                : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <User size={14} className={activeTab === 'mine' ? 'animate-pulse' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">My Posts</span>
                            </div>
                            {activeTab === 'mine' && (
                                <motion.div layoutId="tab-glow" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[var(--bg-primary)] rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Secure Feed Data Stream */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: activeTab === 'all' ? -10 : 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: activeTab === 'all' ? 10 : -10, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <PostList
                                posts={activeTab === 'all' ? allPosts : myPosts}
                                loading={activeTab === 'all' ? loadingAll : loadingMy}
                                emptyMessage={activeTab === 'all' ? "Be the first to share something!" : "You haven't posted anything yet."}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default SocialSection
