import { motion } from 'framer-motion'
import { ArrowLeft, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SocialSection from '@/components/SocialSection'
import UserSearch from '@/components/UserSearch'

const SocialPage = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background Atmosphere Layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] opacity-30" />
            </div>

            {/* Header */}
            <div className="relative px-5 pt-8 pb-6 z-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 min-h-0 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exit Nexus</span>
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-500" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent" />
                            <Globe className="w-7 h-7 text-teal-400 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)] group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none mb-1">
                            SOCIAL NEXUS<span className="text-teal-500 italic text-5xl">.</span>
                        </h1>
                        <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Connect • Share • Explore</p>
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center space-y-3 mb-8 mt-10">
                    <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
                        GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">FEED</span>
                    </h2>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto relative group mb-8">
                    <div className="absolute inset-0 bg-teal-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <UserSearch />
                </div>
            </div>

            {/* Main Social Section */}
            <div className="relative z-10">
                <SocialSection />
            </div>
        </div>
    )
}

export default SocialPage
