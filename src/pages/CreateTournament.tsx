import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tournamentService } from '../services/TournamentService'
import toast, { Toaster } from 'react-hot-toast'
import { Trophy, Target, Shield, Zap, Swords, ChevronLeft } from 'lucide-react'

const CreateTournament = () => {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // Verify host status on mount
    useEffect(() => {
        const verifyHost = async () => {
            const { subscriptionService } = await import('@/services/SubscriptionService');
            const status = await subscriptionService.getSubscriptionStatus();
            if (!status.isHost) {
                toast.error('Host privileges required');
                navigate('/host/benefits');
            }
        };
        verifyHost();
    }, [navigate]);

    const gameConfigs: Record<string, { name: string, color: string, icon: any }> = {
        freefire: { name: 'Free Fire', color: '#00ffc2', icon: Target },
        bgmi: { name: 'BGMI', color: '#fbbf24', icon: Shield },
        valorant: { name: 'Valorant', color: '#ff4655', icon: Zap },
        minecraft: { name: 'Minecraft', color: '#4ade80', icon: Swords }
    }

    const config = gameConfigs[gameId || ''] || { name: 'Tournament', color: '#00ffc2', icon: Trophy }

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
        // Game room config (optional - host can add later via chat)
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
                throw new Error('Start date must be in the future')
            }
            if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
                throw new Error('Registration deadline must be before start date')
            }

            const tournamentData = {
                game: gameId!,
                gameId: gameId!,
                gameName: config.name,
                title: formData.title,
                description: formData.description,
                startDate: new Date(formData.startDate),
                registrationDeadline: new Date(formData.registrationDeadline),
                maxSlots: formData.maxTeams,
                maxTeams: formData.maxTeams,
                teamSize: formData.teamSize,
                entryFee: formData.entryFee,
                mode: formData.format,
                prizeType: formData.prizeType,
                perKillAmount: formData.prizeType === 'kill' ? formData.perKillAmount : 0,
                prizeDistribution: formData.prizeType === 'winner' ? {
                    first: formData.prizeFirst,
                    second: formData.prizeSecond,
                    third: formData.prizeThird
                } : undefined,
                format: formData.format,
                mapMode: formData.mapMode,
                totalMatches: formData.totalMatches,
                gameRoomConfig: {
                    matchTime: formData.matchTime ? new Date(formData.matchTime) : undefined,
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

            toast.success('Tournament LIVE!', {
                style: {
                    background: '#09090b',
                    border: `1px solid ${config.color}`,
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                },
            })

            setTimeout(() => {
                navigate(`/arena/host-dashboard`)
            }, 1500)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Broadcast Failed', {
                style: {
                    background: '#09090b',
                    border: '1px solid #ef4444',
                    color: '#fff',
                },
            })
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full px-5 py-4 bg-[#18181b] border border-white/5 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-white placeholder:text-gray-600 font-medium"
    const labelClasses = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1"

    return (
        <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 selection:bg-[#00ffc2]/30">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto">
                <Link
                    to={`/arena/host-dashboard`}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Panel
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Branding */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-12"
                        >
                            <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 mb-6">
                                <config.icon className="w-10 h-10" style={{ color: config.color }} />
                            </div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">
                                Host Your <span style={{ color: config.color }}>{config.name}</span> Event
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Define the stakes, set the format, and broadcast your tournament to thousands of elite players.
                            </p>

                            <div className="space-y-4">
                                <div className="p-5 rounded-[2rem] bg-[#18181b] border border-white/5">
                                    <div className={labelClasses}>Estimated Prize Pool</div>
                                    <div className="text-3xl font-black italic tracking-tighter" style={{ color: config.color }}>
                                        {formData.entryFee === 0
                                            ? 'FREE TOURNAMENT'
                                            : `₹${(formData.entryFee * (formData.maxTeams || 0)).toLocaleString()}`
                                        }
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                                        {formData.entryFee === 0
                                            ? 'Host will fund prizes from wallet'
                                            : 'Based on full registration'
                                        }
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-8">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            {/* Section: Basic Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-px bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Basic Logistics</span>
                                </div>

                                <div>
                                    <label className={labelClasses}>Tournament Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., SEASON 5: RADIANT CUP"
                                        className={inputClasses}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>Battle Objectives (Description)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Rules, map info, and custom perks..."
                                        rows={4}
                                        className={`${inputClasses} resize-none`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Section: Timing */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-px bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Deployment Window</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClasses}>Battle Start Time</label>
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
                            </div>

                            {/* Section: Mechanics */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-px bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Combat Mechanics</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={labelClasses}>Format</label>
                                        <select
                                            value={formData.format}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                format: e.target.value as 'solo' | 'duo' | 'squad',
                                                teamSize: e.target.value === 'solo' ? 1 : e.target.value === 'duo' ? 2 : 4
                                            })}
                                            className={`${inputClasses} appearance-none cursor-pointer`}
                                        >
                                            <option value="solo">SOLO</option>
                                            <option value="duo">DUO</option>
                                            <option value="squad">SQUAD</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Max Squads</label>
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
                                        <label className={labelClasses}>Match Count</label>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClasses}>Entry Stake (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.entryFee}
                                            onChange={(e) => setFormData({ ...formData, entryFee: parseInt(e.target.value) })}
                                            min="0"
                                            step="50"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Combat Map/Mode</label>
                                        <input
                                            type="text"
                                            value={formData.mapMode}
                                            onChange={(e) => setFormData({ ...formData, mapMode: e.target.value })}
                                            placeholder="BERMUDA / ERANGEL / BIND"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Prize Configuration */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-px bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Prize Structure</span>
                                </div>

                                {/* Prize Type Selector */}
                                <div className="mb-6">
                                    <label className={labelClasses}>Prize Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, prizeType: 'winner' })}
                                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${formData.prizeType === 'winner'
                                                ? 'bg-teal-500 text-black'
                                                : 'bg-[#18181b] text-gray-400 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            Winner-Based
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, prizeType: 'kill' })}
                                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${formData.prizeType === 'kill'
                                                ? 'bg-teal-500 text-black'
                                                : 'bg-[#18181b] text-gray-400 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            Kill-Based
                                        </button>
                                    </div>
                                </div>

                                {/* 98/2 Split Info with ₹10 Cap */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-blue-400 font-black text-sm">98% TO PLAYERS</div>
                                        <div className="text-gray-600">|</div>
                                        <div className="text-orange-400 font-black text-sm">2% PLATFORM FEE (CAP: ₹10)</div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        Platform fee is 2% of total pool, capped at ₹10. Configure how the remaining 98% is distributed.
                                    </p>
                                    <p className="text-[10px] text-gray-500 italic">
                                        If pool × 2% ≤ ₹10 → full 2% applies | If pool × 2% &gt; ₹10 → only ₹10 deducted
                                    </p>
                                    {formData.entryFee === 0 && (
                                        <p className="text-[10px] text-teal-400 font-bold mt-2">
                                            ✓ FREE TOURNAMENT: No platform fee, you fund the prizes
                                        </p>
                                    )}
                                </div>

                                {formData.prizeType === 'winner' ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-6">
                                            <div>
                                                <label className={labelClasses}>1st Place (%)</label>
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
                                                <label className={labelClasses}>2nd Place (%)</label>
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
                                                <label className={labelClasses}>3rd Place (%)</label>
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

                                        <div className="flex items-center justify-between px-1 mt-4">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Total: {formData.prizeFirst + formData.prizeSecond + formData.prizeThird}%
                                            </div>
                                            {formData.prizeFirst + formData.prizeSecond + formData.prizeThird !== 98 && (
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">⚠ Must equal 98%</span>
                                            )}
                                            {formData.prizeFirst + formData.prizeSecond + formData.prizeThird === 98 && (
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">✓ Valid</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className={labelClasses}>Prize Per Kill (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.perKillAmount}
                                            onChange={(e) => setFormData({ ...formData, perKillAmount: parseInt(e.target.value) || 0 })}
                                            placeholder="e.g. 3"
                                            className={inputClasses}
                                            min="0"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Each player will receive ₹{formData.perKillAmount} per kill from the 98% player pool.</p>
                                    </div>
                                )}
                            </div>

                            {/* Section: Game Room Configuration */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-px bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Room Configuration</span>
                                </div>

                                {(gameId === 'freefire' || gameId === 'bgmi') && (
                                    <>
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                            <p className="text-xs text-blue-300 font-bold mb-1">📢 Room Info Not Required</p>
                                            <p className="text-xs text-gray-400">
                                                You can share Room ID & Password via tournament chat 10 minutes before match start.
                                            </p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Match Time</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.matchTime}
                                                onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                                                className={inputClasses}
                                            />
                                        </div>
                                    </>
                                )}

                                {gameId === 'valorant' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClasses}>Custom Lobby ID</label>
                                            <input
                                                type="text"
                                                value={formData.customLobbyId}
                                                onChange={(e) => setFormData({ ...formData, customLobbyId: e.target.value })}
                                                placeholder="VAL-LOBBY-2024"
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Match Code</label>
                                            <input
                                                type="text"
                                                value={formData.matchCode}
                                                onChange={(e) => setFormData({ ...formData, matchCode: e.target.value })}
                                                placeholder="CODE123"
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                )}

                                {gameId === 'minecraft' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelClasses}>Server Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.serverName}
                                                    onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                                                    placeholder="play.esporizon.net"
                                                    className={inputClasses}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>World Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.worldName}
                                                    onChange={(e) => setFormData({ ...formData, worldName: e.target.value })}
                                                    placeholder="SkyWars Arena"
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Game Mode</label>
                                            <input
                                                type="text"
                                                value={formData.gameMode}
                                                onChange={(e) => setFormData({ ...formData, gameMode: e.target.value })}
                                                placeholder="Survival / Creative / Skyblock"
                                                className={inputClasses}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (formData.prizeType === 'winner' && formData.prizeFirst + formData.prizeSecond + formData.prizeThird !== 98) || (formData.prizeType === 'kill' && formData.perKillAmount <= 0)}
                                className="group relative w-full h-16 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ borderBottom: `4px solid ${config.color}` }}
                            >
                                <div
                                    className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                                    style={{ background: config.color }}
                                />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                            />
                                            TRANSMITTING...
                                        </>
                                    ) : 'BROADCAST EVENT'}
                                </span>
                            </button>
                        </motion.form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateTournament
