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
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
            <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 block">
                    Game Balance
                </span>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#fbbf24]/20 p-2 border border-[#fbbf24]/20">
                        <img src="/Images/espo.png" alt="ESPO" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter italic text-[var(--text-primary)]">
                            ₹{balance.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onDeposit}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 transition-all"
                    >
                        <Plus size={14} strokeWidth={4} />
                        Deposit
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onWithdraw}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--glass)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-black uppercase tracking-wider text-xs hover:bg-[var(--surface-hover)] transition-all"
                    >
                        <ArrowUpRight size={14} strokeWidth={3} />
                        Withdraw
                    </motion.button>
                </div>
            </div>

            {/* Decorative Glow match Wallet */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffc2]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
        </div>
    );
};

export default PredictionHeader;
