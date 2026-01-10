import React, { useEffect, useRef } from 'react';

export type GameMode = {
    id: string;
    label: string;
    duration: number; // in seconds
};

interface GameModeSelectorProps {
    modes: GameMode[];
    selectedMode: GameMode;
    onSelectMode: (mode: GameMode) => void;
    disabled: boolean;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ modes, selectedMode, onSelectMode, disabled }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll to selected mode
    useEffect(() => {
        if (selectedRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = selectedRef.current;

            const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.clientWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [selectedMode]);

    return (
        <div className="relative">
            {/* Fade masks for elegant scrolling affordance without bars */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory px-4 hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {modes.map((mode) => {
                    const isActive = selectedMode.id === mode.id;
                    return (
                        <button
                            key={mode.id}
                            ref={isActive ? selectedRef : null}
                            onClick={() => !disabled && onSelectMode(mode)}
                            disabled={disabled}
                            className={`
                                relative flex-shrink-0 px-6 py-3 rounded-2xl snap-center transition-all duration-300
                                ${isActive
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_15px_var(--accent-muted)] scale-105'
                                    : 'bg-[var(--glass)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap z-10 relative">
                                {mode.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GameModeSelector;
