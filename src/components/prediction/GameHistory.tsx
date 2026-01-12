import React, { useState } from 'react';
import { History, BarChart3, TrendingUp, ChevronRight } from 'lucide-react';
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

    // Pagination states
    const [gamePage, setGamePage] = useState(1);
    const [userPage, setUserPage] = useState(1);
    const itemsPerPage = 10;

    // Derived data for Game History (Shared by 'history' and 'chart')
    const totalGamePages = Math.ceil(gameHistory.length / itemsPerPage) || 1;
    const paginatedGameHistory = gameHistory.length > 0
        ? gameHistory.slice((gamePage - 1) * itemsPerPage, gamePage * itemsPerPage)
        : [];

    // Derived data for User History
    const totalUserPages = Math.ceil(userHistory.length / itemsPerPage) || 1;
    const paginatedUserHistory = userHistory.length > 0
        ? userHistory.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage)
        : [];

    const handleGamePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalGamePages) setGamePage(newPage);
    };

    const handleUserPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalUserPages) setUserPage(newPage);
    };

    const getNumberColor = (num: number) => {
        if (num === 0) return ['#22C55E', '#8B5CF6']; // Green + Violet
        if (num === 5) return ['#22C55E', '#EF4444']; // Green + Red
        if ([1, 3, 7, 9].includes(num)) return ['#22C55E']; // Green
        return ['#EF4444']; // Red
    };

    // Reusable Pagination Component
    const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) => (
        <div className="flex items-center justify-center gap-4 py-4 bg-[#151625] border-t border-[var(--border)] mt-auto rounded-b-[2rem]">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1
                    ? 'bg-[#1a1b2e] text-white/20 cursor-not-allowed'
                    : 'bg-[#2a2b3e] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-black shadow-lg'
                    }`}
            >
                <ChevronRight className="w-4 h-4 rotate-180" />
            </button>

            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span className="text-[var(--accent)]">{currentPage}</span> / {totalPages}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages
                    ? 'bg-[#1a1b2e] text-white/20 cursor-not-allowed'
                    : 'bg-[var(--accent)] text-black shadow-lg hover:brightness-110'
                    }`}
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Tabs */}
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
                    {/* Game History Tab */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            className="bg-[var(--surface)]/50 rounded-[2rem] border border-[var(--border)] overflow-hidden flex flex-col"
                        >
                            <div className="grid grid-cols-4 bg-[var(--surface)] text-[9px] font-black text-[var(--text-secondary)] p-4 uppercase tracking-[0.2em] text-center border-b border-[var(--border)]">
                                <div className="text-left pl-2">Period</div>
                                <div>Number</div>
                                <div>Big/Small</div>
                                <div>Color</div>
                            </div>
                            <div className="divide-y divide-[var(--border)] text-sm">
                                {paginatedGameHistory.map((item, i) => (
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
                            <PaginationControls
                                currentPage={gamePage}
                                totalPages={totalGamePages}
                                onPageChange={handleGamePageChange}
                            />
                        </motion.div>
                    )}

                    {/* Chart Tab */}
                    {activeTab === 'chart' && (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] overflow-hidden flex flex-col"
                        >
                            {/* Statistics Header */}
                            <div className="p-4 bg-[var(--surface)] text-[10px] space-y-3 border-b border-[var(--border)]">
                                <div className="flex items-center justify-between text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-2">
                                    <span>Statistic (Last 100 Periods)</span>
                                </div>
                                <div className="grid grid-cols-[100px_repeat(10,1fr)] gap-y-3 text-center">
                                    <div className="text-left font-bold text-[var(--text-secondary)]">Winning Numbers</div>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                        <div key={n} className="flex justify-center">
                                            <div className="w-5 h-5 rounded-full border border-red-500/30 text-red-500 flex items-center justify-center font-bold">{n}</div>
                                        </div>
                                    ))}

                                    <div className="text-left font-bold text-[var(--text-secondary)]">Missing</div>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
                                        const missing = gameHistory.findIndex(item => item.number === n);
                                        return (
                                            <div key={n} className="text-[var(--text-secondary)] font-mono">
                                                {missing === -1 ? gameHistory.length : missing}
                                            </div>
                                        );
                                    })}

                                    <div className="text-left font-bold text-[var(--text-secondary)]">Frequency</div>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
                                        const freq = gameHistory.filter(item => item.number === n).length;
                                        return (
                                            <div key={n} className="text-[var(--text-secondary)] font-mono">
                                                {freq}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Trend Grid */}
                            <div className="relative">
                                {/* Header */}
                                <div className="grid grid-cols-[80px_repeat(10,1fr)_40px] bg-[#1a1b2e] text-[9px] font-bold text-[var(--text-secondary)] py-2 text-center border-b border-[var(--border)]">
                                    <div className="pl-2 text-left">Period</div>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <div key={n}>{n}</div>)}
                                    <div>B/S</div>
                                </div>

                                {/* Grid Content */}
                                <div className="relative">
                                    {/* SVG Overlay for Lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minHeight: `${paginatedGameHistory.length * 40}px` }}>
                                        {/* CSS-based Line Segments for the current page */}
                                        {paginatedGameHistory.map((item, i) => {
                                            const nextItem = paginatedGameHistory[i + 1];
                                            if (!nextItem || i === paginatedGameHistory.length - 1) return null;

                                            const x1 = 18 + (item.number * 7.4) + 3.7;
                                            const x2 = 18 + (nextItem.number * 7.4) + 3.7;

                                            const y1 = (i * 40) + 20;
                                            const y2 = ((i + 1) * 40) + 20;

                                            return (
                                                <line
                                                    key={i}
                                                    x1={`${x1}%`} y1={`${y1}px`}
                                                    x2={`${x2}%`} y2={`${y2}px`}
                                                    stroke="#ef4444"
                                                    strokeWidth="1.5"
                                                    opacity="0.6"
                                                />
                                            );
                                        })}
                                    </svg>

                                    {paginatedGameHistory.map((item, i) => (
                                        <div key={i} className="grid grid-cols-[80px_repeat(10,1fr)_40px] items-center text-center h-[40px] border-b border-[var(--border)] border-dashed hover:bg-[var(--glass)]">
                                            <div className="pl-2 text-left text-[10px] text-[var(--text-secondary)] font-mono">
                                                {item.periodId.slice(-8)}
                                            </div>
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
                                                const isWinner = item.number === n;
                                                const color = getNumberColor(n);
                                                return (
                                                    <div key={n} className="flex justify-center items-center h-full relative z-20">
                                                        {isWinner ? (
                                                            <div
                                                                className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg transform scale-110"
                                                                style={{
                                                                    background: n === 0 || n === 5 ? `linear-gradient(135deg, ${color[0]} 50%, ${color[1]} 50%)` : color[0],
                                                                    boxShadow: `0 0 10px ${color[0]}60`
                                                                }}
                                                            >
                                                                {n}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-[var(--text-secondary)]/30 font-mono">{n}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <div className="flex justify-center">
                                                <div className={`
                                                    w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center border
                                                    ${item.bigSmall === 'Big'
                                                        ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                                                        : 'border-blue-500/30 text-blue-500 bg-blue-500/10'}
                                                `}>
                                                    {item.bigSmall === 'Big' ? 'B' : 'S'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <PaginationControls
                                currentPage={gamePage}
                                totalPages={totalGamePages}
                                onPageChange={handleGamePageChange}
                            />
                        </motion.div>
                    )}

                    {/* My Bets Tab */}
                    {activeTab === 'myhistory' && (
                        <motion.div
                            key="myhistory"
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            className="space-y-3 mb-4 rounded-[2rem] overflow-hidden bg-[#1a1b2e] pb-10"
                        >
                            {userHistory.length === 0 ? (
                                <div className="p-12 text-center bg-[var(--glass)] border border-dashed border-[var(--border)] rounded-[2rem]">
                                    <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">No predictions yet</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="space-y-3 p-2">
                                        {paginatedUserHistory.map((item, i) => (
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
                                        ))}
                                    </div>
                                    <PaginationControls
                                        currentPage={userPage}
                                        totalPages={totalUserPages}
                                        onPageChange={handleUserPageChange}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trust / Fair Policy Footer */}
            <div className="flex justify-center items-center py-4 mt-6">
                <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-40 uppercase tracking-widest text-center">
                    Esporizon Fair Policy
                </p>
            </div>
        </div>
    );
};

export default GameHistory;
