// Framer Motion animation variants for the dashboard

export const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad
        }
    }
}

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5
        }
    }
}

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

export const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

export const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

// Hero character floating animation
export const floatingAnimation = {
    animate: {
        y: [0, -20, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

// Parallax scroll effect for hero character
export const parallaxAnimation = {
    initial: { y: 0 },
    animate: (scrollY: number) => ({
        y: scrollY * 0.5, // Moves at half the speed of scroll
        transition: {
            duration: 0
        }
    })
}

// Counter animation for stats
export const counterAnimation = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "anticipate"
        }
    }
}

// Card hover animation
export const cardHover = {
    rest: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
}

// Progress bar animation
export const progressBarAnimation = {
    hidden: { width: 0 },
    visible: (width: number) => ({
        width: `${width}%`,
        transition: {
            duration: 1,
            ease: "easeOut",
            delay: 0.2
        }
    })
}

// Glow pulse animation for CTA button
export const glowPulse = {
    rest: {
        boxShadow: "0 0 20px rgba(199, 44, 44, 0.3)"
    },
    hover: {
        boxShadow: [
            "0 0 20px rgba(199, 44, 44, 0.3)",
            "0 0 40px rgba(199, 44, 44, 0.6)",
            "0 0 20px rgba(199, 44, 44, 0.3)"
        ],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

// Scroll reveal animation with viewport detection
export const scrollReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}
