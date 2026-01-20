import { useState, useEffect } from 'react'
import { Search, UserPlus, MessageSquare, Check, X, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AvatarWithFrame from '@/components/AvatarWithFrame'
import FriendService, { Friend } from '@/services/FriendService'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/UserService' // Used for search

interface FriendsTabProps {
    onChat?: (friendId: string) => void;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ onChat }) => {
    const { user } = useAuth()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() => {
        refreshData()
    }, [user])

    const refreshData = async () => {
        if (!user) return
        try {
            const [friendsData, requestsData] = await Promise.all([
                FriendService.getMyFriends((user as any).uid),
                FriendService.getRequests()
            ])
            setFriends(friendsData)
            setRequests(requestsData)
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error(err);

            }
        } finally {
            // Loading handled by local state or irrelevant
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setSearching(true)
        try {
            const users = await userService.searchUsers(query)
            setResults(users)
        } catch (err) {
            toast.error('Search failed')
        } finally {
            setSearching(false)
        }
    }

    const sendRequest = async (targetUsername: string) => {
        if (!user) return
        try {
            await FriendService.sendRequest(targetUsername)
            toast.success('Request Sent')
            setQuery('')
            setResults([])
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send request')
        }
    }

    const acceptRequest = async (uid: string) => {
        try {
            await FriendService.acceptRequest(uid)
            toast.success('Ally Accepted')
            refreshData()
        } catch (err) {
            toast.error('Failed to accept')
        }
    }

    const rejectRequest = async (uid: string) => {
        try {
            await FriendService.rejectRequest(uid)
            toast.success('Request Ignored')
            refreshData()
        } catch (err) {
            toast.error('Failed to reject')
        }
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find friends by username..."
                    className="w-full pl-10 pr-4 py-3 bg-[#0E1424]/40 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500/30 transition-all font-medium"
                />
                {query && (
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-teal-500 hover:text-black rounded-lg transition-all text-xs">
                        GO
                    </button>
                )}
            </form>

            {/* Results Area */}
            {searching ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>
            ) : results.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 pl-2">Found Operatives</h3>
                    {results.map(u => (
                        <div key={u.uid} className="flex items-center justify-between p-4 bg-[#0E1424]/60 border border-white/5 rounded-2xl group hover:border-teal-500/20 transition-all">
                            <div className="flex items-center gap-3">
                                <AvatarWithFrame
                                    username={u.username}
                                    rank={u.title || 'ROOKIE'}
                                    size="medium"
                                    avatarType={u.avatarType}
                                />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{u.username}</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{u.title || 'Recruit'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => sendRequest(u.username)}
                                className="p-2 bg-white/5 hover:bg-teal-500 hover:text-black rounded-xl transition-all text-zinc-400"
                            >
                                <UserPlus size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : query && !searching ? (
                <div className="text-center py-8 text-zinc-500 text-xs italic">No operatives found with that callsign.</div>
            ) : null}

            {/* Incoming Requests */}
            {requests.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-500 pl-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" /> Incoming Requests
                    </h3>
                    {requests.map(req => (
                        <div key={req.uid} className="flex items-center justify-between p-3 bg-[#0E1424]/80 border border-teal-500/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <AvatarWithFrame username={req.username} size="small" rank="Recruit" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{req.username}</h4>
                                    <p className="text-[10px] text-zinc-500">Wants to be an ally</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => rejectRequest(req.uid)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                                <button onClick={() => acceptRequest(req.uid)} className="p-2 bg-teal-500/10 text-teal-500 rounded-lg hover:bg-teal-500 hover:text-black transition-colors">
                                    <Check size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Friends List */}
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 pl-2">Allies Online</h3>

                {friends.length === 0 ? (
                    <div className="text-center py-8 bg-[#0E1424]/20 rounded-2xl border border-dashed border-white/5">
                        <UserCheck className="mx-auto text-zinc-700 mb-2 w-8 h-8" />
                        <p className="text-zinc-600 text-xs uppercase tracking-widest">No Friends Added Yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {friends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-3 bg-[#0E1424]/40 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AvatarWithFrame
                                        username={friend.username}
                                        rank={(friend as any).title || 'Rookie'}
                                        avatarType={(friend as any).avatarType as any}
                                        size="medium"
                                    />
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{friend.displayName || friend.username}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'}`} />
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{friend.status || 'Offline'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onChat?.(friend.username)}
                                    className="p-2 bg-white/5 hover:bg-teal-500 hover:text-black rounded-lg transition-all text-zinc-400"
                                >
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FriendsTab
