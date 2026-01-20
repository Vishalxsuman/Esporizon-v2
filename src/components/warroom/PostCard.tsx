import React from 'react';
import { motion } from 'framer-motion';
import { Video, Share2, Clock, Trophy, Info } from 'lucide-react';
import { Post } from '@/services/FeedService';

interface PostCardProps {
    post: Post;
    onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {

    // 1. LIVE TOURNAMENT CARD
    if (post.type === 'live_pulse') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-950/40 to-black border border-red-500/20 rounded-xl p-4 mb-3 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
            >
                {/* Pulsing Backglow */}
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />

                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <Video className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Match is LIVE now</span>
                            </div>
                            <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                                {post.tournamentName || post.content}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{post.game || 'Tournament'}</p>
                        </div>
                    </div>

                    <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-600/20 flex items-center gap-2 transition-colors">
                        Watch Live
                        <Share2 size={10} />
                    </button>
                </div>
            </motion.div>
        );
    }

    // 2. JOIN ALERT (using new type)
    if (post.type === 'join_alert') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1f2e] border-l-4 border-l-yellow-500 border-y border-r border-white/5 rounded-r-xl p-4 mb-3 relative overflow-hidden"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Clock size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">{post.tournamentName}</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                            {(post.slotsLeft || 0) < 5 ? 'Almost Full' : 'Filling Fast'}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // 3. MATCH RESULT
    if (post.type === 'result') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1a1f2e] to-black border border-amber-500/20 rounded-xl p-4 mb-3 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                        <Trophy size={18} fill="currentColor" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Match Result</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{post.winnerName}</h3>
                        {post.game && (
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{post.game} • Winner</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // 4. DEFAULT
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414] border border-white/5 rounded-xl p-4 mb-3 hover:bg-[#1a1a1a] transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Info size={16} />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1 opacity-70">
                        {post.type.replace('_', ' ')}
                    </h3>
                    <p className="text-sm font-medium text-white leading-relaxed">
                        {post.content}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-bold mt-2">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PostCard;
