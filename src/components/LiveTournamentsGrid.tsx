import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { tournamentService } from '@/services/TournamentService'
import { Tournament } from '@/types/tournament'
import SectionSkeleton from '@/components/SectionSkeleton'
import EmptyState from '@/components/EmptyState'
import TournamentCard from '@/components/TournamentCard'

const LiveTournamentsGrid = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true)
                const data = await tournamentService.getTournaments()
                // Filter for live and upcoming only, limit to 6
                const filtered = data
                    .filter(t => t.status === 'live' || t.status === 'upcoming')
                    .slice(0, 6)
                setTournaments(filtered)
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Failed to fetch tournaments:', error);

                }
            } finally {
                setLoading(false)
            }
        }

        fetchTournaments()
    }, [])

    if (loading) {
        return <SectionSkeleton />
    }

    if (tournaments.length === 0) {
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-4 uppercase italic tracking-tight">
                        <span className="w-2 h-8 bg-gradient-to-b from-[#00E0C6] to-transparent rounded-full shadow-[0_0_15px_#00E0C6]"></span>
                        Live & Upcoming Tournaments
                    </h3>
                </div>
                <EmptyState
                    title="No Tournaments Available"
                    description="Check back soon for new tournaments!"
                    actionLabel="Browse All Tournaments"
                    onAction={() => window.location.href = '/tournaments'}
                    icon={<Trophy className="w-16 h-16 text-gray-600 mb-4" />}
                />
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.6)]" />
                    <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                            TACTICAL DEPLOYMENTS
                        </h3>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">
                            LIVE & UPCOMING BATTLEFIELDS
                        </p>
                    </div>
                </div>
                <Link
                    to="/tournaments"
                    className="group flex items-center gap-2 px-6 py-2 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-teal-500/30 transition-all"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-teal-400 transition-colors">View All</span>
                    <div className="w-2 h-2 rounded-full bg-teal-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(20,184,166,1)]" />
                </Link>
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">

                {tournaments.map((tournament, index) => (
                    <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        index={index}
                        compact={true}
                    />
                ))}
            </div>
        </div>
    )
}

export default LiveTournamentsGrid
