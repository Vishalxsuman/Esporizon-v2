import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight } from 'lucide-react';

interface PredictionHeaderProps {
    balance: number;
    onDeposit: () => void;
    onWithdraw: () => void;
}

const PredictionHeader: React.FC<PredictionHeaderProps> = ({ balance, onDeposit, onWithdraw }) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--bg-secondary)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-xl">
            <div className="relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 block">
                    Game Balance
                </span>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/20 p-1.5 border border-[#fbbf24]/20">
                        <img src="/Images/espo.png" alt="ESPO" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tighter italic text-[var(--text-primary)]">
                            ₹{balance.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onDeposit}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 transition-all"
                    >
                        <Plus size={12} strokeWidth={4} />
                        Deposit
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onWithdraw}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[var(--glass)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-black uppercase tracking-wider text-[10px] hover:bg-[var(--surface-hover)] transition-all"
                    >
                        <ArrowUpRight size={12} strokeWidth={3} />
                        Withdraw
                    </motion.button>
                </div>
            </div>

            {/* Decorative Glow match Wallet */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00ffc2]/5 blur-[80px] -mr-24 -mt-24 rounded-full" />
        </div>
    );
};

export default PredictionHeader;
