import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tournamentService } from '../services/TournamentService'
import toast, { Toaster } from 'react-hot-toast'
import { Trophy, Target, Shield, Zap, Swords, ChevronLeft, IndianRupee, Map, Info, Clock, LayoutGrid, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const CreateTournament = () => {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const { user, updateUserHostStatus } = useAuth()
    const [loading, setLoading] = useState(false)

    // Verify host status on mount & Auto-Upgrade
    useEffect(() => {
        const verifyHost = async () => {
            if (!user) return;
            const { subscriptionService } = await import('@/services/SubscriptionService');
            const { hostService } = await import('@/services/HostService');

            const status = await subscriptionService.getSubscriptionStatus();

            if (!status.isHost) {
                toast.loading('Activating Host Privileges...', { id: 'host-activation' });
                try {
                    const result = await hostService.activateHost();
                    if (result.success) {
                        updateUserHostStatus(true);
                        toast.success('You are now a Host!', { id: 'host-activation' });
                    } else {
                        toast.error('Failed to activate host status', { id: 'host-activation' });
                        navigate('/host/benefits');
                    }
                } catch (error) {
                    if (import.meta.env.MODE !== 'production') {

                        console.error('Auto-upgrade error:', error);

                    }
                    navigate('/host/benefits');
                }
            }
        };
        verifyHost();
    }, [navigate, updateUserHostStatus, user]);

    const gameConfigs: Record<string, { name: string, color: string, icon: any }> = {
        freefire: { name: 'Free Fire', color: '#10b981', icon: Target },
        bgmi: { name: 'BGMI', color: '#fbbf24', icon: Shield },
        valorant: { name: 'Valorant', color: '#ff4655', icon: Zap },
        minecraft: { name: 'Minecraft', color: '#4ade80', icon: Swords }
    }

    const config = gameConfigs[gameId || ''] || { name: 'Tournament', color: '#14b8a6', icon: Trophy }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        registrationDeadline: '',
        maxTeams: 50,
        teamSize: 1,
        entryFee: 100,
        format: 'solo' as 'solo' | 'duo' | 'squad',
        mapMode: '',
        totalMatches: 1,
        prizeType: 'winner' as 'winner' | 'kill',
        prizeFirst: 60,
        prizeSecond: 25,
        prizeThird: 13,
        perKillAmount: 0,
        matchTime: '',
        customLobbyId: '',
        teamSlots: 0,
        matchCode: '',
        serverName: '',
        worldName: '',
        gameMode: '',
        maxPlayers: 0
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (new Date(formData.startDate) <= new Date()) {
                throw new Error('Deployment must be in the future')
            }
            if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
                throw new Error('Registration must end before launch')
            }

            const calculatedPrizePool = formData.entryFee * formData.maxTeams;

            const tournamentData = {
                name: formData.title.trim(),
                game: gameId,
                mode: formData.format,
                entryFee: Number(formData.entryFee),
                prizePool: Number(calculatedPrizePool),
                maxSlots: Number(formData.maxTeams),
                startTime: new Date(formData.startDate),
                description: formData.description,
                registrationDeadline: new Date(formData.registrationDeadline),
                teamSize: Number(formData.teamSize),
                prizeDistribution: formData.prizeType === 'winner' ? {
                    first: formData.prizeFirst,
                    second: formData.prizeSecond,
                    third: formData.prizeThird
                } : undefined,
                perKillAmount: formData.prizeType === 'kill' ? formData.perKillAmount : 0,
                mapMode: formData.mapMode,
                totalMatches: formData.totalMatches,
                gameRoomConfig: {
                    customLobbyId: formData.customLobbyId || undefined,
                    teamSlots: formData.teamSlots || undefined,
                    matchCode: formData.matchCode || undefined,
                    serverName: formData.serverName || undefined,
                    worldName: formData.worldName || undefined,
                    gameMode: formData.gameMode || undefined,
                    maxPlayers: formData.maxPlayers || undefined
                }
            }

            await tournamentService.createTournament(tournamentData)

            toast.success('ARENA LIVE!', {
                style: {
                    background: '#0E1424',
                    border: '1px solid #14b8a6',
                    color: '#fff',
                    fontWeight: 'black',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                },
            })

            setTimeout(() => {
                navigate('/host/dashboard')
            }, 1500)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Uplink Failed', {
                style: {
                    background: '#0E1424',
                    border: '1px solid #ef4444',
                    color: '#fff',
                },
            })
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full px-6 py-4 bg-[#18181b]/40 border border-white/5 rounded-2xl focus:outline-none focus:border-teal-500/30 transition-all text-white placeholder:text-zinc-700 font-bold"
    const labelClasses = "block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 ml-1"

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white pb-32 font-sans overflow-x-hidden">
            <Toaster position="top-center" />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-teal-500/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-600/5 blur-[120px]" />
            </div>

            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-all group"
                >
                    <ChevronLeft className="text-zinc-500 group-hover:text-white" size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.3em] italic flex items-center gap-2">
                    <Shield size={18} className="text-teal-400" />
                    Forge New Arena
                </h1>
                <div className="w-10 h-10" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Branding & Status */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-24 space-y-8"
                        >
                            <div className="relative group w-fit">
                                <div className="absolute inset-0 bg-teal-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-6 rounded-[2rem] bg-[#0E1424] border border-white/10 shadow-2xl">
                                    <config.icon className="w-12 h-12" style={{ color: config.color }} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
                                    {config.name} <span className="text-teal-500">DEPLOYS</span>.
                                </h2>
                                <p className="text-zinc-500 font-bold text-base italic leading-relaxed">
                                    Configure your battlefield parameters, set technical constraints, and broadcast to the elite sector.
                                </p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-[#0E1424]/40 border border-white/5 shadow-inner space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block">Projected Bounty</span>
                                <div className="text-5xl font-black italic tracking-tighter text-teal-400">
                                    {formData.entryFee === 0
                                        ? 'FREE'
                                        : `₹${(formData.entryFee * (formData.maxTeams || 0)).toLocaleString()}`
                                    }
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Pool Estimation</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Form Segments */}
                    <div className="lg:col-span-8">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-12"
                        >
                            {/* Section: Operational Intel */}
                            <FormSection title="Operational Intel" icon={<Info size={14} />}>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Battle Designation (Title)</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., SECTOR 7: QUANTUM STRIKE"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Combat Directives (Description)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Define engagement rules, technical limits, and reward structures..."
                                            rows={5}
                                            className={`${inputClasses} resize-none py-6`}
                                            required
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            {/* Section: Deployment Window */}
                            <FormSection title="Deployment Window" icon={<Clock size={14} />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClasses}>Battle Launch Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Registration Cut-off</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.registrationDeadline}
                                            onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            {/* Section: Tactical Parameters */}
                            <FormSection title="Tactical Parameters" icon={<LayoutGrid size={14} />}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={labelClasses}>Squad Protocol</label>
                                        <select
                                            value={formData.format}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                format: e.target.value as 'solo' | 'duo' | 'squad',
                                                teamSize: e.target.value === 'solo' ? 1 : e.target.value === 'duo' ? 2 : 4
                                            })}
                                            className={`${inputClasses} appearance-none cursor-pointer`}
                                        >
                                            <option value="solo">SOLO (1 UNIT)</option>
                                            <option value="duo">DUO (2 UNITS)</option>
                                            <option value="squad">SQUAD (4 UNITS)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Deployment Limit</label>
                                        <input
                                            type="number"
                                            value={formData.maxTeams}
                                            onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
                                            min="2"
                                            max="100"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Engagement Rounds</label>
                                        <input
                                            type="number"
                                            value={formData.totalMatches}
                                            onChange={(e) => setFormData({ ...formData, totalMatches: parseInt(e.target.value) })}
                                            min="1"
                                            max="10"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className={labelClasses}>Access Stake (Entry ₹)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 w-4 h-4" />
                                            <input
                                                type="number"
                                                value={formData.entryFee}
                                                onChange={(e) => setFormData({ ...formData, entryFee: parseInt(e.target.value) })}
                                                min="0"
                                                className={`${inputClasses} pl-14`}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Area of Operation (Map)</label>
                                        <div className="relative">
                                            <Map className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={formData.mapMode}
                                                onChange={(e) => setFormData({ ...formData, mapMode: e.target.value })}
                                                placeholder="ERANGEL / BIND / BERMUDA"
                                                className={`${inputClasses} pl-14`}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </FormSection>

                            {/* Section: Bounty Logic */}
                            <FormSection title="Bounty logic" icon={<Trophy size={14} />}>
                                <div className="bg-teal-500/5 border border-teal-500/10 rounded-3xl p-6 mb-8">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="px-3 py-1 bg-teal-500 text-black font-black text-[9px] rounded-full uppercase">Verified protocol</div>
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">98% Deployment Pool • 2% Protocol (Cap ₹10)</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-500 italic leading-relaxed">
                                        Free tournaments waive platform deductions. You are responsible for bounty provision.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, prizeType: 'winner' })}
                                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${formData.prizeType === 'winner'
                                            ? 'bg-teal-500 border-teal-400 text-black shadow-lg shadow-teal-500/20'
                                            : 'bg-white/5 border-transparent text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        Placement Logic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, prizeType: 'kill' })}
                                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${formData.prizeType === 'kill'
                                            ? 'bg-teal-500 border-teal-400 text-black shadow-lg shadow-teal-500/20'
                                            : 'bg-white/5 border-transparent text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        Elimination Logic
                                    </button>
                                </div>

                                {formData.prizeType === 'winner' ? (
                                    <div className="grid grid-cols-3 gap-6 animate-fadeIn">
                                        <div>
                                            <label className={labelClasses}>1st (%)</label>
                                            <input
                                                type="number"
                                                value={formData.prizeFirst}
                                                onChange={(e) => setFormData({ ...formData, prizeFirst: parseInt(e.target.value) || 0 })}
                                                className={inputClasses}
                                                min="0"
                                                max="98"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>2nd (%)</label>
                                            <input
                                                type="number"
                                                value={formData.prizeSecond}
                                                onChange={(e) => setFormData({ ...formData, prizeSecond: parseInt(e.target.value) || 0 })}
                                                className={inputClasses}
                                                min="0"
                                                max="98"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>3rd (%)</label>
                                            <input
                                                type="number"
                                                value={formData.prizeThird}
                                                onChange={(e) => setFormData({ ...formData, prizeThird: parseInt(e.target.value) || 0 })}
                                                className={inputClasses}
                                                min="0"
                                                max="98"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <label className={labelClasses}>Elimination Bounty (₹ / Kill)</label>
                                        <input
                                            type="number"
                                            value={formData.perKillAmount}
                                            onChange={(e) => setFormData({ ...formData, perKillAmount: parseInt(e.target.value) || 0 })}
                                            className={inputClasses}
                                            min="0"
                                            required
                                        />
                                    </div>
                                )}
                            </FormSection>

                            <button
                                type="submit"
                                disabled={loading || (formData.prizeType === 'winner' && formData.prizeFirst + formData.prizeSecond + formData.prizeThird !== 98) || (formData.prizeType === 'kill' && formData.perKillAmount <= 0)}
                                className={`w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm transition-all duration-500 flex items-center justify-center gap-4 shadow-3xl ${loading ? 'bg-zinc-800' : 'bg-white text-black hover:bg-teal-500'
                                    } disabled:opacity-30 disabled:grayscale active:scale-[0.98] group`}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Authorize & Deploy Arena <ArrowLeft rotate={180} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Layout Helper antisocial antisocial
const FormSection = ({ title, icon, children }: any) => (
    <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
                {icon}
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">{title}</h3>
        </div>
        <div className="p-10 bg-[#0E1424]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl">
            {children}
        </div>
    </div>
)

export default CreateTournament
