import { useEffect, useState } from 'react'
import { Post } from '@/services/FeedService'
import FeedItem from '@/components/feed/FeedItem'

interface GlobalFeedProps {
    type: string
}

const GlobalFeed = ({ type }: GlobalFeedProps) => {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true)
            try {
                // Mocking data for now as per specific requirements
                // In production, uncomment: const data = await feedService.getPosts(type);

                const mockData: Post[] = [
                    {
                        _id: '1',
                        type: 'live_pulse',
                        tournamentName: 'Free Fire Squad Clash',
                        game: 'Free Fire',
                        content: 'Semi-Finals LIVE! Team Soul vs Godlike',
                        tournamentId: 't1',
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: '2',
                        type: 'join_alert',
                        tournamentName: 'BGMI Weekend War',
                        slotsLeft: 12,
                        tournamentId: 't2',
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: '3',
                        type: 'friend_activity',
                        authorName: 'Vishal',
                        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vishal',
                        activityText: 'joined a tournament',
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: '4',
                        type: 'result',
                        winnerName: 'Team Alpha',
                        prizeWon: 500,
                        game: 'Valorant',
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: '5',
                        type: 'user_post',
                        authorName: 'ProGamer123',
                        authorUsername: 'progamer',
                        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                        content: 'Looking for a sniper for upcoming BGMI tournament. Min KD 3.0 required.',
                        createdAt: new Date().toISOString(),
                        likes: ['u1', 'u2'],
                        comments: []
                    }
                ];

                // If type is 'global', show only global relevant stuff? 
                // For now, showing diversity.

                setPosts(mockData)
            } catch (err) {
                if (import.meta.env.MODE !== 'production') {

                    console.error(err);

                }
            } finally {
                setLoading(false)
            }
        }
        loadPosts()
    }, [type])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 animate-pulse">
                    Scanning Feed...
                </p>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="p-12 text-center mt-6 border border-dashed border-zinc-800 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600">Feed Silent</h3>
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-tighter mt-1">
                    No active posts • Be the first
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-6 pb-20">
            {posts.map((post) => (
                <FeedItem key={post._id} post={post} />
            ))}

            <div className="text-center py-8 text-zinc-600 text-xs uppercase tracking-widest border-t border-white/5 mt-8">
                End of Transmission
            </div>
        </div>
    )
}

export default GlobalFeed


