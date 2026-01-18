import { motion } from 'framer-motion'
import { Lock, Star } from 'lucide-react'
import { TrustLevel, TRUST_LEVELS } from '@/types/WarRoomTypes'

interface TrustLevelBadgeProps {
    level: TrustLevel
    size?: 'small' | 'medium' | 'large'
    showLabel?: boolean
}

const TrustLevelBadge = ({ level, size = 'medium', showLabel = true }: TrustLevelBadgeProps) => {
    const levelInfo = TRUST_LEVELS[level]

    const sizeClasses = {
        small: 'w-5 h-5 text-[9px]',
        medium: 'w-6 h-6 text-[10px]',
        large: 'w-10 h-10 text-xs'
    }

    const iconSizes = {
        small: 'w-2.5 h-2.5',
        medium: 'w-3 h-3',
        large: 'w-5 h-5'
    }

    const renderIcon = () => {
        if (level === 0) {
            return <Lock className={iconSizes[size]} />
        }
        return <Star className={iconSizes[size]} fill="currentColor" />
    }

    return (
        <div className="flex items-center gap-2 group relative">
            {/* Badge Icon */}
            <motion.div
                className={`
                    ${sizeClasses[size]} rounded-lg flex items-center justify-center
                    font-black uppercase tracking-wider relative overflow-hidden
                `}
                style={{
                    background: `linear-gradient(145deg, ${levelInfo.color}15, ${levelInfo.color}05)`,
                    border: `1px solid ${levelInfo.color}40`,
                    color: levelInfo.color,
                    boxShadow: `0 0 15px ${levelInfo.color}20, inset 0 0 10px ${levelInfo.color}10`
                }}
                whileHover={{ scale: 1.05 }}
            >
                {renderIcon()}

                {/* Shimmer effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${levelInfo.color}30, transparent)`,
                        animation: 'shimmer 2s infinite'
                    }}
                />
            </motion.div>

            {/* Label */}
            {showLabel && size !== 'small' && (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: levelInfo.color }}>
                        {levelInfo.name}
                    </span>
                    {size === 'large' && (
                        <span className="text-[8px] text-zinc-600 uppercase tracking-wide">
                            Level {level}
                        </span>
                    )}
                </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                <div className="text-[10px] font-bold text-white mb-1">{levelInfo.name}</div>
                <div className="text-[9px] text-zinc-400">{levelInfo.description}</div>
                {level < 3 && (
                    <div className="text-[8px] text-[#00ff88] mt-1 italic">
                        {levelInfo.requirements}
                    </div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/95" />
                </div>
            </div>
        </div>
    )
}

export default TrustLevelBadge

// Add this to your global CSS for the shimmer effect
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
