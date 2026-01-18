import { Crown, Shield, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface AvatarWithFrameProps {
    username: string;
    rank: string;
    avatarType?: 'initials' | 'geometric' | 'gradient' | 'default';
    size?: 'small' | 'medium' | 'large';
    showBadge?: boolean;
    className?: string;
}

const AvatarWithFrame = ({
    username,
    rank,
    avatarType = 'initials',
    size = 'medium',
    showBadge = true,
    className = ''
}: AvatarWithFrameProps) => {
    // Size configurations
    const sizeConfig = {
        small: {
            container: 'w-16 h-16',
            rounded: 'rounded-xl',
            badge: 'w-5 h-5',
            badgeIcon: 10,
            badgePosition: '-bottom-1 -right-1'
        },
        medium: {
            container: 'w-24 h-24',
            rounded: 'rounded-2xl',
            badge: 'w-7 h-7',
            badgeIcon: 12,
            badgePosition: '-bottom-1.5 -right-1.5'
        },
        large: {
            container: 'w-32 h-32',
            rounded: 'rounded-[2rem]',
            badge: 'w-8 h-8',
            badgeIcon: 14,
            badgePosition: '-bottom-2 -right-2'
        }
    };

    const config = sizeConfig[size];

    // Rank-based colors
    const getRankColor = (rank: string) => {
        switch (rank?.toLowerCase()) {
            case 'elite':
                return 'from-yellow-400 via-orange-500 to-red-600';
            case 'pro':
                return 'from-purple-400 to-pink-600';
            case 'diamond':
                return 'from-blue-400 to-cyan-500';
            case 'platinum':
                return 'from-teal-400 to-emerald-500';
            case 'gold':
                return 'from-yellow-300 to-amber-500';
            case 'silver':
                return 'from-slate-300 to-slate-400';
            default:
                return 'from-stone-500 to-stone-700'; // Bronze
        }
    };

    // Rank badge icon
    const getRankIcon = (rank: string) => {
        const iconSize = config.badgeIcon;
        switch (rank?.toLowerCase()) {
            case 'elite':
            case 'pro':
                return <Crown size={iconSize} className="text-white drop-shadow-md" />;
            case 'diamond':
            case 'platinum':
                return <Star size={iconSize} className="text-white drop-shadow-md" />;
            case 'gold':
                return <Trophy size={iconSize} className="text-white drop-shadow-md" />;
            default:
                return <Shield size={iconSize} className="text-white drop-shadow-md" />;
        }
    };

    // Generate avatar based on type
    const getAvatarSrc = () => {
        const initial = username?.charAt(0).toUpperCase() || 'E';

        switch (avatarType) {
            case 'initials':
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=256&bold=true`;
            case 'geometric':
                return `https://source.boringavatars.com/beam/256/${encodeURIComponent(username)}?colors=14b8a6,06b6d4,8b5cf6,ec4899,f59e0b`;
            case 'gradient':
                return `https://source.boringavatars.com/bauhaus/256/${encodeURIComponent(username)}?colors=14b8a6,06b6d4,8b5cf6,ec4899,f59e0b`;
            default:
                return `https://ui-avatars.com/api/?name=${initial}&background=1a1a1a&color=14b8a6&size=256&bold=true`;
        }
    };

    const rankGradient = getRankColor(rank);

    return (
        <div className={`relative ${className}`}>
            {/* Rank Glow */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${rankGradient} blur-2xl opacity-20`}
                animate={{ opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Avatar Frame Container */}
            <div className={`relative ${config.container} ${config.rounded} p-[3px] bg-gradient-to-br ${rankGradient}`}>
                <div className={`w-full h-full ${config.rounded === 'rounded-xl' ? 'rounded-[0.65rem]' : config.rounded === 'rounded-2xl' ? 'rounded-[1.8rem]' : 'rounded-[1.8rem]'} bg-[var(--bg-primary)] overflow-hidden relative`}>
                    {/* Avatar Image */}
                    <img
                        src={getAvatarSrc()}
                        alt={`${username}'s avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=256&bold=true`;
                        }}
                    />
                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                </div>

                {/* Rank Badge */}
                {showBadge && (
                    <motion.div
                        className={`absolute ${config.badgePosition} bg-[var(--bg-primary)] p-1 rounded-full border border-[var(--border)]`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <div className={`${config.badge} rounded-full bg-gradient-to-br ${rankGradient} flex items-center justify-center shadow-lg`}>
                            {getRankIcon(rank)}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AvatarWithFrame;
