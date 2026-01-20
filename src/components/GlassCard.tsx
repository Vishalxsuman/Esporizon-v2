import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
    children: ReactNode
    className?: string
    hoverEffect?: boolean
}

const GlassCard = ({ children, className = '', hoverEffect = true }: GlassCardProps) => {
    return (
        <motion.div
            initial="rest"
            whileHover={hoverEffect ? "hover" : "rest"}
            variants={{
                rest: { scale: 1 },
                hover: { scale: 1.02 }
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
        backdrop-blur-md bg-white/5 
        border border-white/10 
        rounded-xl p-6
        shadow-lg
        ${className}
      `}
            style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(20px)',
            }}
        >
            {children}
        </motion.div>
    )
}

export default GlassCard
