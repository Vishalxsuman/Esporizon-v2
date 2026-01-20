import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, UserPlus, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '@/services/UserService';
import FriendService from '@/services/FriendService';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import { useAuth } from '@/contexts/AuthContext';

interface FriendRequestPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const FriendRequestPanel: React.FC<FriendRequestPanelProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'requests' | 'search'>('requests');

    // Search State
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Requests State
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen]);

    const fetchRequests = async () => {
        try {
            const data = await FriendService.getRequests();
            setRequests(data);
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error(err);

            }
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const results = await userService.searchUsers(query);
            // Filter out self
            setSearchResults(results.filter((u: any) => u.uid !== user?.uid));
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const sendRequest = async (username: string) => {
        try {
            await FriendService.sendRequest(username);
            toast.success(`Request sent to ${username}`);
            // Optimistic update: remove from search results or show 'Sent'
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send');
        }
    };

    const acceptRequest = async (uid: string) => {
        try {
            await FriendService.acceptRequest(uid);
            toast.success('Friend accepted');
            setRequests(prev => prev.filter(r => r.uid !== uid));
        } catch (err) {
            toast.error('Failed to accept');
        }
    };

    const rejectRequest = async (uid: string) => {
        try {
            await FriendService.rejectRequest(uid);
            toast.success('Request removed');
            setRequests(prev => prev.filter(r => r.uid !== uid));
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#0F1420] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#0a0e1a]">
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <ChevronLeft className="text-zinc-400" />
                            </button>
                            <h2 className="text-lg font-black uppercase tracking-wide text-white">Social Hub</h2>
                        </div>

                        {/* Tabs */}
                        <div className="grid grid-cols-2 p-2 gap-2 bg-[#0a0e1a]">
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'requests' ? 'bg-teal-500 text-black' : 'bg-[#1a1f2e] text-zinc-500 hover:text-white'}`}
                            >
                                Requests {requests.length > 0 && `(${requests.length})`}
                            </button>
                            <button
                                onClick={() => setActiveTab('search')}
                                className={`py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'search' ? 'bg-teal-500 text-black' : 'bg-[#1a1f2e] text-zinc-500 hover:text-white'}`}
                            >
                                Add Friends
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {activeTab === 'requests' ? (
                                <div className="space-y-4">
                                    {requests.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                                            <Shield size={48} className="mb-4 opacity-50" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No Pending Requests</p>
                                        </div>
                                    ) : (
                                        requests.map(req => (
                                            <div key={req.uid} className="bg-[#1a1f2e] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <AvatarWithFrame username={req.username} rank={req.title || 'Rookie'} size="small" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">{req.username}</h4>
                                                        <p className="text-[10px] text-zinc-500">{req.title || 'Rookie'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => acceptRequest(req.uid)} className="px-3 py-1.5 bg-teal-500 text-black text-[10px] font-bold uppercase rounded hover:bg-teal-400">Accept</button>
                                                    <button onClick={() => rejectRequest(req.uid)} className="px-3 py-1.5 bg-white/5 text-zinc-400 text-[10px] font-bold uppercase rounded hover:bg-white/10">Ignore</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <form onSubmit={handleSearch} className="relative">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search by username..."
                                            className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                                    </form>

                                    {isSearching ? (
                                        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                                    ) : (
                                        <div className="space-y-3">
                                            {searchResults.map((user: any) => (
                                                <div key={user.uid} className="bg-[#1a1f2e] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <AvatarWithFrame
                                                            username={user.username}
                                                            rank={user.title || 'Player'}
                                                            avatarType={user.avatarType}
                                                            size="small"
                                                        />
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white">{user.username}</h4>
                                                            <p className="text-[10px] text-zinc-500">{user.title || 'Player'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => sendRequest(user.username)}
                                                        className="p-2 bg-white/5 hover:bg-teal-500 hover:text-black rounded-lg transition-colors text-zinc-400"
                                                    >
                                                        <UserPlus size={16} />
                                                    </button>
                                                </div>
                                            ))}

                                            {query && searchResults.length === 0 && !isSearching && (
                                                <div className="text-center py-8 text-zinc-600 text-xs">No operatives found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FriendRequestPanel;
