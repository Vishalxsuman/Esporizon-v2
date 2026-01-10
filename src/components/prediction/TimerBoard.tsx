import React from 'react';
import { Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerBoardProps {
    timeLeft: number;
    periodId: string;
    isLocked: boolean;
    lastResult: number;
    onShowHowToPlay: () => void;
    modeLabel: string;
}

const getNumberColor = (num: number) => {
    if (num === 0) return ['#22C55E', '#8B5CF6']; // Green + Violet
    if (num === 5) return ['#22C55E', '#EF4444']; // Green + Red
    if ([1, 3, 7, 9].includes(num)) return ['#22C55E']; // Green
    return ['#EF4444']; // Red (2, 4, 6, 8)
};

const TimerBoard: React.FC<TimerBoardProps> = ({
    timeLeft,
    periodId,
    isLocked,
    lastResult,
    onShowHowToPlay
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (
            <div className="flex items-baseline gap-1">
                <span>{mins.toString().padStart(2, '0')}</span>
                <span className="animate-pulse">:</span>
                <span>{secs.toString().padStart(2, '0')}</span>
            </div>
        );
    };

    const colors = getNumberColor(lastResult);
    const isMultiColor = colors.length > 1;

    return (
        <div className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--border)] rounded-[2.5rem] p-6 mb-6 relative overflow-hidden group">

            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-[var(--accent)]" />
                        <span className="text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em]">
                            {isLocked ? 'Betting Locked' : 'Time Remaining'}
                        </span>
                    </div>
                    <motion.div
                        key={timeLeft}
                        animate={timeLeft <= 5 ? { scale: [1, 1.05, 1], color: '#EF4444' } : {}}
                        transition={{ duration: 0.5 }}
                        className={`text-5xl font-black italic tracking-tighter tabular-nums
                        ${isLocked ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-[var(--text-primary)]'}
                    `}>
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mt-1">
                        Period: {periodId}
                    </div>
                </div>

                {/* Last Result & Help */}
                <div className="flex flex-col items-end gap-3">
                    <button
                        onClick={onShowHowToPlay}
                        className="flex items-center gap-1 bg-[var(--surface)] hover:bg-[var(--surface-hover)] px-3 py-1.5 rounded-full text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-wide transition-colors border border-[var(--border)]"
                    >
                        <HelpCircle className="w-3 h-3" />
                        Guide
                    </button>

                    <div className="flex items-center gap-3 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--border)] text-right pl-4">
                        <div>
                            <div className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-wider">Result</div>
                            <div className="text-[10px] font-black text-[var(--text-primary)] uppercase">{lastResult >= 5 ? 'Big' : 'Small'}</div>
                        </div>

                        <motion.div
                            key={lastResult}
                            initial={{ rotateX: 90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            className="relative w-10 h-10"
                        >
                            <div
                                className="absolute inset-0 rounded-xl shadow-inner flex items-center justify-center overflow-hidden"
                                style={{ background: colors[0] }}
                            >
                                {isMultiColor && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                                )}
                                <span className="text-xl font-black text-white drop-shadow-md z-10 italic">{lastResult}</span>
                            </div>
                            {isMultiColor && (
                                <div
                                    className="absolute inset-0 rounded-xl clip-path-diagonal"
                                    style={{
                                        background: colors[1],
                                        clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
                                    }}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Locked Visual Indicator */}
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-[2.5rem]"
                >
                    <div className="bg-red-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 border border-red-400/30">
                        <AlertCircle className="w-4 h-4" />
                        STOP BETTING
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default TimerBoard;
