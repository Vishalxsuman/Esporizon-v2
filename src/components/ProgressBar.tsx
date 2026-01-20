import { motion } from 'framer-motion'

interface ProgressBarProps {
    progress: number // 0-100
    color?: string
    glowColor?: string
    height?: string
    showLabel?: boolean
    className?: string
}

const ProgressBar = ({
    progress,
    color = '#c72c2c',
    glowColor = '#ff6a00',
    height = 'h-2',
    showLabel = false,
    className = ''
}: ProgressBarProps) => {
    return (
        <div className={`relative ${className}`}>
            {showLabel && (
                <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">{progress}%</span>
                </div>
            )}
            <div className={`w-full bg-white/10 rounded-full ${height} overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.2
                    }}
                    className={`${height} rounded-full relative`}
                    style={{
                        background: `linear-gradient(90deg, ${color} 0%, ${glowColor} 100%)`,
                        boxShadow: `0 0 10px ${color}40`
                    }}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 rounded-full opacity-50"
                        style={{
                            background: `linear-gradient(90deg, transparent 0%, ${glowColor} 100%)`,
                            filter: 'blur(4px)'
                        }}
                    />
                </motion.div>
            </div>
        </div>
    )
}

export default ProgressBar
