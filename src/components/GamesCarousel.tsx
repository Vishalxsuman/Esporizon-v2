import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2 } from 'lucide-react'

interface Game {
    id: string
    name: string
    platform: string
    imageUrl: string
    color: string
}

const games: Game[] = [
    {
        id: 'freefire',
        name: 'FREE FIRE',
        platform: 'MOBILE',
        imageUrl: 'https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/freefire.png',
        color: 'from-red-500/20 to-orange-500/20'
    },
    {
        id: 'bgmi',
        name: 'BGMI',
        platform: 'MOBILE',
        imageUrl: 'https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/bgmi.png',
        color: 'from-orange-500/20 to-yellow-600/20'
    },
    {
        id: 'valorant',
        name: 'VALORANT',
        platform: 'PC',
        imageUrl: 'https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/valorant.png',
        color: 'from-red-600/20 to-pink-500/20'
    },
    {
        id: 'minecraft',
        name: 'MINECRAFT',
        platform: 'PC',
        imageUrl: 'https://cdn.jsdelivr.net/gh/Vishalxsuman/Esporizon-v2@main/Images/minecraft.png',
        color: 'from-green-500/20 to-emerald-500/20'
    }
]

const GamesCarousel = () => {
    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="mb-10">
                <h3 className="text-3xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                    <span className="w-2 h-10 bg-gradient-to-b from-[#00E0C6] to-transparent rounded-full shadow-[0_0_15px_#00E0C6]"></span>
                    Featured Games
                </h3>
            </div>

            {/* 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link
                            to={`/arena/${game.id}`}
                            className="block group"
                        >
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#0E1424] hover:border-[#00E0C6] transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(0,224,198,0.3)] hover:scale-[1.03] hover:-translate-y-1">
                                {/* Game Image */}
                                <img
                                    src={game.imageUrl}
                                    alt={game.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                    }}
                                />

                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-85 group-hover:opacity-70 transition-opacity duration-300"></div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-40 transition-opacity duration-300`}></div>

                                {/* Platform Badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                    <Gamepad2 className="w-3.5 h-3.5 text-[#00E0C6]" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{game.platform}</span>
                                </div>

                                {/* Game Info - Bottom */}
                                <div className="absolute bottom-0 left-0 w-full p-5">
                                    <h4 className="text-2xl font-black text-white group-hover:text-[#00E0C6] transition-colors drop-shadow-lg uppercase italic mb-2 leading-tight">
                                        {game.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                                        <span>Enter Arena</span>
                                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#00E0C6]/10 to-transparent"></div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default GamesCarousel
