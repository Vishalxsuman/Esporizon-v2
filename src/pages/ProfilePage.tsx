import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    Moon,
    Gamepad2,
    Bell,
    ShieldCheck,
    LogOut,
    Trash2,
    ChevronRight,
    Wallet,
    Trophy,
    Star,
    Zap,
    Target,
    Activity,
    Users,
    Briefcase
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userRepository } from '@/repositories/UserRepository'
import { UserProfile } from '@/types'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'
import EditProfileModal from '@/components/EditProfileModal'
import ParticlesBackground from '@/components/ParticlesBackground'

const ProfilePage = () => {
    const { user, signOut } = useAuth()
    const { userId: paramId } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()

    const targetUserId = paramId || user?.uid

    useEffect(() => {
        if (!targetUserId) return

        setLoading(true)
        const unsubscribe = userRepository.subscribeToProfile(targetUserId, (data) => {
            setProfile(data)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [targetUserId])

    const isOwnProfile = user?.uid === targetUserId

    const handleToggleSetting = async (key: keyof UserProfile['settings']) => {
        if (!user || !profile || !isOwnProfile) return
        try {
            await userRepository.updateProfile(user.uid, {
                settings: {
                    ...profile.settings,
                    [key]: !profile.settings[key]
                }
            })
        } catch (error) {
            toast.error('Failed to update tactical settings')
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/auth')
        } catch (error) {
            toast.error('Extraction failed: Protocol error')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#00ffc2]/10 border-t-[#00ffc2] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Target className="text-[#00ffc2] animate-pulse" size={20} />
                    </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#00ffc2]">Decrypting Profile...</p>
            </div>
        )
    }

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group"
        >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color}`} />
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-xl bg-white/5 text-gray-400 group-hover:text-white transition-colors`}>
                    <Icon size={18} />
                </div>
                <div className="text-[10px] font-black tracking-widest text-[#00ffc2] opacity-0 group-hover:opacity-100 transition-opacity">LVL 99</div>
            </div>
            <div className="text-2xl font-black italic tracking-tighter text-white">{value}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">{label}</div>
        </motion.div>
    )

    return (
        <div className="min-h-screen bg-[#09090b] text-white pb-32 relative overflow-hidden">
            <Toaster position="top-center" />
            <ParticlesBackground />

            {/* Premium Header */}
            <div className="relative z-10 px-6 py-8 flex items-center justify-between max-w-xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-1">Sector 7 Personnel</div>
                    <h1 className="text-sm font-black uppercase tracking-widest italic text-white flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#00ffc2]" /> Profile Uplink
                    </h1>
                </div>
                {isOwnProfile ? (
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[var(--accent)] hover:text-black transition-all group"
                    >
                        <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                ) : (
                    <div className="w-11" /> // Spacer
                )}
            </div>

            <div className="max-w-xl mx-auto px-6 space-y-8 relative z-10">
                {/* Hero Profile Section */}
                <div className="relative pt-12 text-center">
                    <div className="relative inline-block mb-6">
                        {/* Interactive Avatar Border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ffc2] via-[#7c3aed] to-[#00ffc2] rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#00ffc2] to-[#7c3aed] p-1 shadow-[0_0_50px_rgba(0,255,194,0.15)]">
                            <div className="w-full h-full rounded-[2.3rem] bg-[#09090b] flex items-center justify-center overflow-hidden border-2 border-[#18181b]">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black italic text-gray-700">{profile?.username?.charAt(0).toUpperCase() || 'E'}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2.5 bg-[#00ffc2] rounded-2xl shadow-[0_0_20px_#00ffc2] border-4 border-[#09090b]">
                                <Star size={14} className="text-[#09090b] fill-current" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                {profile?.username || 'Elite Gamer'}
                            </h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00ffc2]/10 border border-[#00ffc2]/20 rounded-full mt-3">
                                <Activity size={10} className="text-[#00ffc2]" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-[#00ffc2] uppercase">
                                    @{profile?.username || 'player'}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs font-medium max-w-xs mx-auto leading-relaxed border-l-2 border-white/5 pl-4 ml-4 italic">
                            {profile?.bio || 'Professional Esports Player. Always ready for the next combat.'}
                        </p>
                    </div>

                    {isOwnProfile && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                            >
                                <Moon size={16} className={theme === 'dark' ? 'text-[#00ffc2]' : 'text-gray-400'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">
                                    {theme === 'dark' ? 'Dark Ops Enabled' : 'Light Mode Active'}
                                </span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#00ffc2]' : 'bg-gray-700'}`}>
                                    <motion.div
                                        animate={{ x: theme === 'dark' ? 22 : 2 }}
                                        className="absolute top-1 w-3 h-3 bg-white rounded-full"
                                    />
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Tactical Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={Trophy}
                        label="Combat Victories"
                        value={profile?.tournamentsWon || 0}
                        color="from-yellow-400 to-amber-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Active Campaigns"
                        value={profile?.tournamentsPlayed || 0}
                        color="from-blue-400 to-indigo-600"
                    />
                    <StatCard
                        icon={Wallet}
                        label="Total Earnings"
                        value={`₹${profile?.totalEarnings?.toLocaleString() || 0}`}
                        color="from-[#00ffc2] to-emerald-600"
                    />
                    <StatCard
                        icon={Briefcase}
                        label="Referral Income"
                        value={`₹${profile?.referralEarnings?.toLocaleString() || 0}`}
                        color="from-[#7c3aed] to-purple-600"
                    />
                </div>

                {/* Profile Tabs/Sections */}
                <div className="space-y-6">
                    {/* Game IDs Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                            <Gamepad2 className="text-[#00ffc2]" size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ffc2]">Tactical Identifiers</h3>
                        </div>
                        <div className="grid gap-3">
                            {['BGMI', 'Free Fire', 'Valorant', 'Minecraft'].map((game) => {
                                const key = game.toLowerCase().replace(' ', '')
                                const gameId = profile?.gameAccounts?.[key as keyof UserProfile['gameAccounts']]
                                return (
                                    <div key={game} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#00ffc2] group-hover:border-[#00ffc2]/30 transition-all">
                                                <Target size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{game}</div>
                                                <div className="text-sm font-black italic tracking-tight text-white">{gameId || 'Not Configured'}</div>
                                            </div>
                                        </div>
                                        {isOwnProfile && <ChevronRight size={14} className="text-gray-700 group-hover:text-white" />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {isOwnProfile && (
                        <>
                            {/* Command & Control (Settings/Actions) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 ml-2">
                                    <ShieldCheck className="text-purple-500" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Command & Control</h3>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
                                    <Link to="/wallet" className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="p-3 bg-[#fbbf24]/10 rounded-2xl text-[#fbbf24] border border-[#fbbf24]/20 group-hover:scale-110 transition-transform">
                                                <Wallet size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-widest text-white">Central Bank</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manage Assets & Rewards</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
                                    </Link>

                                    <button className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-widest text-white">Security Uplink</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">2FA & Access Protocols</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
                                    </button>

                                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-all group text-red-500">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 group-hover:scale-110 transition-transform">
                                                <LogOut size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-widest">Protocol Exit</div>
                                                <div className="text-[10px] text-red-500/40 font-bold uppercase tracking-widest mt-0.5">Terminate Active Session</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Alert Notifications */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 ml-2">
                                    <Bell className="text-blue-500" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Signal Filters</h3>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                                    {[
                                        { id: 'tournamentReminders', label: 'Tactical Alerts', desc: 'Tournament starts & countdowns' },
                                        { id: 'matchResults', label: 'Intel Reports', desc: 'Game outcomes & stats' },
                                        { id: 'newTournaments', label: 'Mission Briefs', desc: 'New tournament availability' }
                                    ].map((setting) => (
                                        <div key={setting.id} className="flex items-center justify-between p-5 hover:bg-white/[0.03] transition-all">
                                            <div className="text-left">
                                                <div className="text-xs font-black uppercase tracking-widest text-white">{setting.label}</div>
                                                <div className="text-[9px] font-bold text-gray-600 uppercase mt-0.5">{setting.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleSetting(setting.id as keyof UserProfile['settings'])}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-500 ${profile?.settings[setting.id as keyof UserProfile['settings']] ? 'bg-[#00ffc2] shadow-[0_0_15px_rgba(0,255,194,0.3)]' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: profile?.settings[setting.id as keyof UserProfile['settings']] ? 26 : 4 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Termination Section */}
                {isOwnProfile && (
                    <div className="pt-8 text-center space-y-4">
                        <button className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900 hover:text-red-500 transition-colors flex items-center gap-2 mx-auto px-6 py-3 border border-red-900/20 rounded-2xl hover:bg-red-950/20">
                            <Trash2 size={12} /> Operational Termination
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                user={user}
            />
        </div>
    )
}

export default ProfilePage
