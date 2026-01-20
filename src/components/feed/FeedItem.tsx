import React from 'react';
import { Post } from '@/services/FeedService';
import {
    Clock,
    Trophy,
    Zap,
    ArrowRight,
    User,
    MessageCircle,
    Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedItemProps {
    post: Post;
}

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
    const navigate = useNavigate();

    // 1. Live Tournament Pulse (Pinned, High Priority)
    if (post.type === 'live_pulse') {
        return (
            <div className="bg-gradient-to-r from-red-600/20 to-red-900/10 border border-red-500/30 rounded-xl p-4 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Zap size={64} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Live Now
                    </div>
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        {post.game || 'Tournament'}
                    </span>
                </div>
                <h3 className="text-white font-black italic text-lg leading-tight mb-2">
                    {post.tournamentName || 'Tournament Starting'}
                </h3>
                {post.content && (
                    <p className="text-zinc-300 text-sm mb-3">
                        {post.content}
                    </p>
                )}
                {post.tournamentId && (
                    <button
                        onClick={() => navigate(`/tournament/${post.tournamentId}`)}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        Spectate Now <ArrowRight size={14} />
                    </button>
                )}
            </div>
        );
    }

    // 2. Join Alert (< 20% Slots)
    if (post.type === 'join_alert') {
        return (
            <div className="bg-gradient-to-r from-teal-500/10 to-teal-900/10 border border-teal-500/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-teal-400" />
                            <span className="text-teal-400 text-[10px] font-black uppercase tracking-wider">
                                Filling Fast
                            </span>
                        </div>
                        <h3 className="text-white font-bold text-md mb-1">
                            {post.tournamentName}
                        </h3>
                        <p className="text-zinc-400 text-xs mb-3">
                            Only {post.slotsLeft ? post.slotsLeft : 'few'} slots remaining!
                        </p>
                    </div>
                    {post.tournamentId && (
                        <button
                            onClick={() => navigate(`/tournament/${post.tournamentId}`)}
                            className="bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold uppercase py-2 px-4 rounded-lg shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-colors"
                        >
                            Join
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 3. Result Card (Winner Announced)
    if (post.type === 'result') {
        return (
            <div className="bg-[#121217] border border-white/5 rounded-xl p-0 mb-4 overflow-hidden relative">
                <div className="bg-gradient-to-b from-yellow-500/20 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                            Winner Announced
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50 text-yellow-500 text-xl font-black">
                            {post.winnerName?.charAt(0).toUpperCase() || 'W'}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg leading-none mb-1">
                                {post.winnerName || 'Unknown Team'}
                            </h3>
                            <p className="text-zinc-400 text-xs">
                                Won <span className="text-white font-bold">₹{post.prizeWon || 0}</span> in {post.game || 'Tournament'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Friend Activity
    if (post.type === 'friend_activity') {
        return (
            <div className="flex items-center gap-3 py-3 border-b border-white/5 px-2 mb-2">
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-500 text-xs font-bold overflow-hidden">
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                            post.authorName?.charAt(0).toUpperCase() || <User size={14} />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#09090b]"></div>
                </div>
                <div className="flex-1">
                    <p className="text-zinc-300 text-xs">
                        <span className="text-white font-bold">{post.authorName || 'Friend'}</span> {post.activityText || 'is active'}
                    </p>
                    <span className="text-[10px] text-zinc-500">
                        {new Date(post.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        );
    }

    // 5. User Post (LFG / Standard)
    return (
        <div className="bg-[#121217] border border-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 font-bold overflow-hidden">
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                            post.authorName?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">
                            {post.authorName || 'User'}
                        </h4>
                        <span className="text-[10px] text-zinc-500 block">
                            @{post.authorUsername || 'user'} • {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
                {post.content}
            </p>

            {post.image && (
                <div className="rounded-lg overflow-hidden mb-4 border border-white/5">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                </div>
            )}

            <div className="flex items-center gap-6 border-t border-white/5 pt-3">
                <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider group">
                    <Heart size={16} className="group-hover:fill-red-500 transition-all" />
                    <span>{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                    <MessageCircle size={16} />
                    <span>{post.comments?.length || 0}</span>
                </button>
            </div>
        </div>
    );
};

export default FeedItem;
