import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface AnimatedCounterProps {
    value: number
    decimals?: number
    prefix?: string
    suffix?: string
    className?: string
}

const AnimatedCounter = ({
    value,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = ''
}: AnimatedCounterProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true })
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100
    })

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [isInView, motionValue, value])

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = prefix + latest.toFixed(decimals) + suffix
            }
        })

        return () => unsubscribe()
    }, [springValue, decimals, prefix, suffix])

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
        >
            {prefix}0{suffix}
        </motion.span>
    )
}

export default AnimatedCounter
