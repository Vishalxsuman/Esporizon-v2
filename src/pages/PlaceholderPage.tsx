import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Construction } from 'lucide-react'

interface PlaceholderPageProps {
    title: string
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#09090b' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-premium max-w-md w-full p-8 text-center"
            >
                <Construction className="w-16 h-16 mx-auto mb-6 text-[#00ffc2] opacity-50" />
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-gray-400 mb-8">This feature is currently under development. Check back soon!</p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    )
}

export default PlaceholderPage
