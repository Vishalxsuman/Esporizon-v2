import React, { useState } from 'react';
import { History, BarChart3, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GameHistoryItem {
    periodId: string;
    number: number;
    bigSmall: 'Big' | 'Small';
    colors: string[];
}

export interface UserHistoryItem {
    id?: string;
    periodId: string;
    selection: string;
    amount: number;
    result: 'Win' | 'Lose' | 'Pending';
    payout: number;
    createdAt?: any;
}

interface GameHistoryProps {
    gameHistory: GameHistoryItem[];
    userHistory: UserHistoryItem[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ gameHistory, userHistory }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'chart' | 'myhistory'>('history');

    const getNumberColor = (num: number) => {
        if (num === 0) return ['#22C55E', '#8B5CF6']; // Green + Violet
        if (num === 5) return ['#22C55E', '#EF4444']; // Green + Red
        if ([1, 3, 7, 9].includes(num)) return ['#22C55E']; // Green
        return ['#EF4444']; // Red
    };

    return (
        <div className="space-y-6">
            {/* Tabs - Styled like Wallet "Operation Records" header but interactive */}
            <div className="flex items-center justify-between px-2">
                <div className="flex bg-[var(--surface)] p-1 rounded-xl shadow-inner border border-[var(--border)] w-full">
                    {[
                        { id: 'history', label: 'History', icon: History },
                        { id: 'chart', label: 'Chart', icon: BarChart3 },
                        { id: 'myhistory', label: 'My Bets', icon: TrendingUp },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-md'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)]'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[350px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/50"
                        >
                            <div className="grid grid-cols-4 bg-[var(--surface)] text-[9px] font-black text-[var(--text-secondary)] p-4 uppercase tracking-[0.2em] text-center border-b border-[var(--border)]">
                                <div className="text-left pl-2">Period</div>
                                <div>Number</div>
                                <div>Big/Small</div>
                                <div>Color</div>
                            </div>
                            <div className="divide-y divide-[var(--border)] text-sm">
                                {gameHistory.slice(0, 10).map((item, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-4 items-center p-4 text-center hover:bg-[var(--glass)] transition-colors"
                                    >
                                        <div className="text-left pl-2 text-[var(--text-secondary)] font-mono text-xs">
                                            {(() => {
                                                const parts = item.periodId.split('-');
                                                return parts.length === 3 ? `${parts[1]}${parts[2]}` : item.periodId;
                                            })()}
                                        </div>
                                        <div className="font-black text-lg italic" style={{ color: getNumberColor(item.number)[0] }}>
                                            {item.number}
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-wider ${item.bigSmall === 'Big' ? 'text-orange-400' : 'text-blue-400'}`}>
                                            {item.bigSmall}
                                        </div>
                                        <div className="flex justify-center gap-1.5">
                                            {item.colors.map((c, ci) => (
                                                <div
                                                    key={ci}
                                                    className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/10"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chart' && (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[350px] flex flex-col pt-4 relative bg-[var(--surface)]/50 rounded-[2rem] border border-[var(--border)] p-6"
                        >
                            <div className="absolute top-6 left-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Number Trend (Last 20)</div>

                            {/* Grid Lines */}
                            <div className="absolute inset-0 z-0 flex flex-col justify-end px-6 pb-8 pt-16 space-y-8 opacity-10 pointer-events-none">
                                <div className="border-t border-[var(--text-secondary)] border-dashed w-full h-full flex-1"></div>
                                <div className="border-t border-[var(--text-secondary)] border-dashed w-full h-full flex-1"></div>
                                <div className="border-t border-[var(--text-secondary)] border-dashed w-full h-full flex-1"></div>
                            </div>

                            <div className="flex-1 flex items-end justify-between gap-1 z-10 pt-8">
                                {gameHistory.slice(0, 20).reverse().map((item, i) => {
                                    const height = (item.number + 1) * 8 + 5; // Dynamic height
                                    const color = getNumberColor(item.number)[0];
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1 group flex-1 h-full justify-end">
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: `${height}%`, opacity: 1 }}
                                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                                className="w-full max-w-[12px] rounded-t-lg relative hover:brightness-125 transition-all"
                                                style={{ backgroundColor: color }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-primary)] font-bold">
                                                    {item.number}
                                                </div>
                                            </motion.div>
                                            <span className="text-[8px] text-[var(--text-secondary)] font-mono mt-1">{item.number}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'myhistory' && (
                        <motion.div
                            key="myhistory"
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="space-y-3"
                        >
                            {userHistory.length === 0 ? (
                                <div className="p-12 text-center bg-[var(--glass)] border border-dashed border-[var(--border)] rounded-[2rem]">
                                    <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">No predictions yet</p>
                                </div>
                            ) : (
                                userHistory.slice(0, 10).map((item, i) => (
                                    <div
                                        key={i}
                                        className="p-5 bg-[var(--glass)] border border-[var(--border)] rounded-3xl flex items-center justify-between group hover:border-[var(--accent)]/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                            w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg
                                            ${item.result === 'Win' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
                                                    item.result === 'Lose' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}
                                        `}>
                                                <div className="w-6 h-6 p-1 border rounded-lg border-[var(--border)] flex items-center justify-center bg-black/20">
                                                    {item.result === 'Win' ? '✓' : item.result === 'Lose' ? '✗' : '?'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-wide text-[var(--text-primary)]">
                                                    {item.selection}
                                                </div>
                                                <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mt-1">
                                                    ID: {item.periodId.slice(-8)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-black text-lg italic tracking-tighter ${item.payout >= 0 ? 'text-[var(--accent)]' : 'text-red-500'}`}>
                                                {item.payout > 0 ? '+' : ''}{item.payout}
                                            </div>
                                            <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mt-1">
                                                Bet: {item.amount}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GameHistory;
