import { useState, useEffect } from 'react'
import { Plus, Trash2, User, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import TeamService, { Team } from '@/services/TeamService'
import { useAuth } from '@/contexts/AuthContext'

const GAME_OPTIONS = ['BGMI', 'Free Fire', 'Valorant', 'Minecraft']

const TeamsTab = () => {
    const { user } = useAuth()
    const [teams, setTeams] = useState<Team[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Form State
    const [teamName, setTeamName] = useState('')
    const [teamType, setTeamType] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SQUAD')
    const [selectedGame, setSelectedGame] = useState('BGMI')
    const [players, setPlayers] = useState<string[]>([''])

    useEffect(() => {
        loadTeams()
    }, [user])

    const loadTeams = async () => {
        if (!user) return
        try {
            const data = await TeamService.getMyTeams((user as any).uid)
            setTeams(data)
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error(err);

            }
        } finally {
            // Loading handled by suspense or ignored
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this team?')) {
            const success = await TeamService.deleteTeam(id)
            if (success) {
                toast.success('Team disbanded')
                loadTeams()
            } else {
                toast.error('Failed to disband team')
            }
        }
    }

    const handleCreate = async () => {
        if (!user) return
        if (!teamName.trim()) return toast.error('Team name required')

        const validPlayers = players.filter(p => p.trim().length > 0)
        if (validPlayers.length === 0 && teamType !== 'SOLO') return toast.error('Add at least one player')

        try {
            await TeamService.createTeam((user as any).uid, {
                name: teamName,
                game: selectedGame,
                type: teamType,
                players: validPlayers.map(ign => ({ ign }))
            })

            setShowCreateModal(false)
            resetForm()
            toast.success('Squad formed successfully')
            loadTeams()
        } catch (err) {
            toast.error('Failed to create team')
        }
    }

    const resetForm = () => {
        setTeamName('')
        setTeamType('SQUAD')
        setPlayers([''])
        setSelectedGame('BGMI')
    }

    const updatePlayerInput = (idx: number, val: string) => {
        const newPlayers = [...players]
        newPlayers[idx] = val
        setPlayers(newPlayers)
    }

    useEffect(() => {
        // Reset players when type changes
        setPlayers([''])
    }, [teamType])

    return (
        <div className="space-y-6">
            {/* Header / Empty State */}
            {teams.length === 0 ? (
                <div className="text-center py-12 bg-[#0E1424]/40 border border-white/5 rounded-2xl">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-base font-black text-white italic uppercase mb-2">No Active Units</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-6 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-teal-400 transition-all"
                    >
                        Create Team
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> New Squad
                    </button>
                    {teams.map(team => (
                        <div key={team._id} className="p-5 bg-[#0E1424]/60 border border-white/5 rounded-2xl group hover:border-teal-500/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(team._id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-xl">
                                    {team.game === 'BGMI' ? '🔫' : team.game === 'Valorant' ? '⚔️' : team.game === 'Free Fire' ? '🔥' : '⛏️'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-white italic">{team.name}</h3>
                                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-white/10 text-zinc-400">{team.type}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-3">{team.game}</div>

                                    <div className="flex flex-wrap gap-2">
                                        {team.players.map((p, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-white/5">
                                                <User size={10} className="text-zinc-500" />
                                                <span className="text-xs text-zinc-300">{p.ign || '(Empty)'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-5"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">Assemble Content</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Team Name</label>
                                    <input
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-teal-500 outline-none"
                                        placeholder="e.g. Delta Force"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Game</label>
                                        <select
                                            value={selectedGame}
                                            onChange={(e) => setSelectedGame(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                                        >
                                            {GAME_OPTIONS.map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Format</label>
                                        <select
                                            value={teamType}
                                            onChange={(e) => setTeamType(e.target.value as any)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                                        >
                                            <option value="SOLO" className="bg-black">SOLO</option>
                                            <option value="DUO" className="bg-black">DUO</option>
                                            <option value="SQUAD" className="bg-black">SQUAD</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Roster</label>
                                    <div className="space-y-2">
                                        {Array.from({ length: teamType === 'DUO' ? 2 : teamType === 'SQUAD' ? 4 : 1 }).map((_, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input
                                                    value={players[i] || ''}
                                                    onChange={(e) => updatePlayerInput(i, e.target.value)}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-teal-500 outline-none"
                                                    placeholder={`Player ${i + 1} IGN`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full py-3 bg-teal-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-teal-400 transition-all"
                            >
                                Save Team
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default TeamsTab
