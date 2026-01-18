import { useState, useEffect } from 'react';
import { Sparkles, Trophy, TrendingUp } from 'lucide-react';

interface BannerSlide {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    accent: string;
}

const BannerCarousel = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides: BannerSlide[] = [
        {
            id: '1',
            icon: <Sparkles className="w-5 h-5" />,
            title: 'Premium Tournaments',
            description: 'Compete in verified skill-based battles',
            accent: 'teal'
        },
        {
            id: '2',
            icon: <Trophy className="w-5 h-5" />,
            title: 'Fair Play Guaranteed',
            description: 'Admin-verified matches with transparent results',
            accent: 'teal'
        },
        {
            id: '3',
            icon: <TrendingUp className="w-5 h-5" />,
            title: 'Earn Responsibly',
            description: 'Build reputation as a trusted tournament host',
            accent: 'teal'
        }
    ];

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused, slides.length]);

    return (
        <div
            className="mb-8 relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Swipeable Container */}
            <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                <div
                    className="flex transition-transform duration-1000 cubic-bezier(0.23, 1, 0.32, 1)"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            className="min-w-full relative overflow-hidden"
                        >
                            {/* Decorative Background Glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />

                            {/* Banner Card - Figma-Grade Premium */}
                            <div className="bg-gradient-to-br from-zinc-900/40 via-zinc-900/60 to-zinc-900/20 backdrop-blur-2xl p-7 flex items-center gap-5 border-t border-white/5">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative text-teal-400 group-hover:animate-pulse">
                                        {slide.icon}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-[1px] w-4 bg-teal-500/50" />
                                        <span className="text-[10px] font-black tracking-[0.2em] text-teal-500/80 uppercase">Esporizon Elite</span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-tight tracking-tight italic">
                                        {slide.title.toUpperCase()}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium tracking-wide max-w-[180px] sm:max-w-[200px]">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Indicators - FIXED: Using divs with onClick to bypass global button min-height */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className="cursor-pointer py-2 group/dot"
                        >
                            <div className={`transition-all duration-500 rounded-full ${index === activeSlide
                                ? 'w-8 h-1 bg-gradient-to-r from-teal-400 to-cyan-400'
                                : 'w-2 h-1 bg-zinc-700/80 group-hover/dot:bg-zinc-600'
                                }`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BannerCarousel;
