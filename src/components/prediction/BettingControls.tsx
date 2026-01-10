import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

type Tab = 'color' | 'number' | 'big_small';

interface BettingControlsProps {
    isLocked: boolean;
    balance: number;
    onPlaceBet: (selection: string, amount: number, type: 'color' | 'number' | 'big_small') => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({ isLocked, balance, onPlaceBet }) => {
    const [activeTab, setActiveTab] = useState<Tab>('color');
    const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState<string>('10');

    // Reset selection when tab changes
    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setSelectedPrediction(null);
    };

    const handleSelect = (value: string) => {
        if (isLocked) return;
        setSelectedPrediction(value);
    };

    const handleSubmit = () => {
        if (!selectedPrediction) {
            toast.error('Please make a selection');
            return;
        }

        const amount = parseInt(betAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > balance) {
            toast.error('Insufficient balance');
            return;
        }

        if (isLocked) {
            toast.error('Betting is closed for this round');
            return;
        }

        onPlaceBet(selectedPrediction, amount, activeTab);
        toast.success('Bet Placed Successfully');
        // Reset selection but keep amount for quick re-bet
        setSelectedPrediction(null);
    };

    const getNumberColor = (num: number) => {
        if (num === 0) return ['bg-gradient-to-br from-green-500 to-violet-500'];
        if (num === 5) return ['bg-gradient-to-br from-green-500 to-red-500'];
        if ([1, 3, 7, 9].includes(num)) return ['bg-green-500'];
        return ['bg-red-500'];
    };

    return (
        <div className="bg-[var(--glass)] border border-[var(--border)] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
            {/* Background glow similar to wallet */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent)]/5 blur-[50px] rounded-full pointer-events-none" />

            {/* Segmented Control Tabs */}
            <div className="relative flex bg-[var(--surface)] p-1 rounded-2xl mb-8 shadow-inner border border-[var(--border)]">
                {(['color', 'number', 'big_small'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors z-10
                            ${activeTab === tab ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                        `}
                    >
                        {tab.replace('_', ' / ')}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[var(--glass)] rounded-xl shadow-lg border border-[var(--border)] -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="mb-8 min-h-[180px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'color' && (
                        <motion.div
                            key="color"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-3 gap-3"
                        >
                            {[
                                { name: 'Green', color: 'bg-[#22C55E]', shadow: 'shadow-[#22C55E]/20', multi: 'x2' },
                                { name: 'Violet', color: 'bg-[#8B5CF6]', shadow: 'shadow-[#8B5CF6]/20', multi: 'x4.5' },
                                { name: 'Red', color: 'bg-[#EF4444]', shadow: 'shadow-[#EF4444]/20', multi: 'x2' },
                            ].map((item) => (
                                <motion.button
                                    key={item.name}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelect(item.name)}
                                    disabled={isLocked}
                                    className={`
                                        relative h-28 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all overflow-hidden group border border-white/5
                                        ${item.color}
                                        ${selectedPrediction === item.name
                                            ? `ring-4 ring-[var(--accent)] ring-offset-2 ring-offset-[#09090b] scale-105 z-10 shadow-xl ${item.shadow}`
                                            : `opacity-90 hover:opacity-100 shadow-lg ${item.shadow}`
                                        }
                                        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                    <span className="text-white font-black text-sm relative z-10 uppercase tracking-widest">{item.name}</span>

                                    {selectedPrediction === item.name && (
                                        <div className="absolute top-2 right-2 bg-[var(--accent)] text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-20">✓</div>
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'number' && (
                        <motion.div
                            key="number"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-5 gap-3"
                        >
                            {Array.from({ length: 10 }).map((_, i) => {
                                const bgClass = getNumberColor(i)[0];
                                const isSelected = selectedPrediction === i.toString();
                                return (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleSelect(i.toString())}
                                        disabled={isLocked}
                                        className={`
                                        aspect-square rounded-full flex flex-col items-center justify-center shadow-lg transition-all relative border border-white/5
                                        ${bgClass}
                                        ${isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#09090b] scale-110 z-10' : 'hover:scale-105'}
                                        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                    `}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
                                        <span className="text-white font-bold text-xl relative z-10">{i}</span>
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'big_small' && (
                        <motion.div
                            key="big_small"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('Big')}
                                disabled={isLocked}
                                className={`
                                    h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center relative overflow-hidden transition-all border border-white/10
                                    ${selectedPrediction === 'Big' ? 'ring-4 ring-[var(--accent)] ring-offset-2 ring-offset-[#09090b] scale-105' : 'hover:brightness-110'}
                                    ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="text-2xl font-black text-white mb-2 uppercase italic tracking-widest">Big</div>
                                <div className="bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-bold">5-9 • x2</div>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect('Small')}
                                disabled={isLocked}
                                className={`
                                    h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden transition-all border border-white/10
                                    ${selectedPrediction === 'Small' ? 'ring-4 ring-[var(--accent)] ring-offset-2 ring-offset-[#09090b] scale-105' : 'hover:brightness-110'}
                                    ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="text-2xl font-black text-white mb-2 uppercase italic tracking-widest">Small</div>
                                <div className="bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-bold">0-4 • x2</div>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bet Amount Section */}
            <div className="bg-[var(--surface)] rounded-2xl p-5 mb-6 border border-[var(--border)]">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">Bet Amount</label>
                    <div className="text-[var(--accent)] text-[10px] font-black uppercase tracking-wider">Balance: ₹{balance}</div>
                </div>

                <div className="relative mb-6">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 border border-[#fbbf24]/30 rounded-full flex items-center justify-center bg-[#fbbf24]/10">
                        <span className="text-[#fbbf24] text-xs">₹</span>
                    </div>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 text-[var(--text-primary)] text-2xl font-black italic focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/50 transition-colors placeholder:text-[var(--text-secondary)]/30"
                        placeholder="0"
                    />
                </div>

                {/* Quick Multipliers - HIDE SCROLLBARS */}
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {[1, 5, 10, 50, 100].map(multiplier => (
                        <button
                            key={multiplier}
                            onClick={() => {
                                const current = parseInt(betAmount) || 0;
                                setBetAmount((current > 0 ? current * multiplier : 10 * multiplier).toString());
                            }}
                            className="flex-shrink-0 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 text-[var(--accent)] px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap"
                        >
                            x{multiplier}
                        </button>
                    ))}
                    <div className="w-[1px] bg-[var(--border)] mx-1"></div>
                    {[100, 500, 1000].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setBetAmount(amt.toString())}
                            className="flex-shrink-0 bg-[var(--glass)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] px-4 py-2.5 rounded-xl text-[10px] font-bold transition-colors"
                        >
                            +{amt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLocked || !selectedPrediction}
                className={`
                    w-full py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] italic text-[var(--bg-primary)] shadow-lg transition-all relative overflow-hidden group
                    ${isLocked || !selectedPrediction
                        ? 'bg-[var(--surface)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border)]'
                        : 'bg-[var(--accent)] shadow-[0_4px_14px_0_rgba(0,255,194,0.39)]'
                    }
                `}
            >
                {/* Shine Effect */}
                {!isLocked && selectedPrediction && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                )}

                {isLocked ? 'Round Locked' : 'Confim Prediction'}
            </motion.button>
        </div>
    );
};

export default BettingControls;
