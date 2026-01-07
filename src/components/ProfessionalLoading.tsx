import { motion } from 'framer-motion'

interface LoadingProps {
    message?: string
}

const ProfessionalLoading = ({ message = 'Syncing Arena...' }: LoadingProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-12">
            <div className="relative w-20 h-20">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00ffc2] opacity-40"
                />

                {/* Inner Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#00ffc2] opacity-80"
                />

                {/* Pulse Center */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-6 bg-[#00ffc2] rounded-full blur-md shadow-[0_0_20px_#00ffc2]"
                />
            </div>

            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 italic">
                    {message}
                </span>
            </motion.div>
        </div>
    )
}

export default ProfessionalLoading
