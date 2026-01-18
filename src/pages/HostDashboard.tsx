import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { subscriptionService } from '@/services/SubscriptionService';
import {
    Trophy,
    Flame,
    Target,
    Crown,
    Plus,
    Settings,
    TrendingUp,
    Shield,
    Wallet,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const games = [
    { id: 'freefire', name: 'Free Fire', icon: Flame, color: 'from-orange-500 to-red-600' },
    { id: 'bgmi', name: 'BGMI', icon: Target, color: 'from-teal-500 to-green-600' },
    { id: 'valorant', name: 'Valorant', icon: Trophy, color: 'from-red-500 to-pink-600' },
    { id: 'minecraft', name: 'Minecraft', icon: Crown, color: 'from-green-500 to-emerald-600' }
];

// Helper component for stats cards
const StatCard = ({ title, value, change, icon: Icon }: { title: string; value: string; change: string; icon: any }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-500/10 rounded-xl">
                <Icon className="text-teal-400" size={24} />
            </div>
            <span className="text-sm text-green-400 font-bold">{change}</span>
        </div>
        <div>
            <p className="text-zinc-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    </motion.div>
);

const HostDashboard = () => {
    const navigate = useNavigate();
    const [activeGame, setActiveGame] = useState('freefire');
    const [loading, setLoading] = useState(true);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        checkHostStatus();
    }, []);

    const checkHostStatus = async () => {
        try {
            const status = await subscriptionService.getSubscriptionStatus();
            setIsHost(status.isHost);

            if (!status.isHost) {
                if (localStorage.getItem('user_is_host') === 'true') {
                    setIsHost(true);
                    return;
                }
                toast.error('Host subscription required');
                navigate('/host/benefits');
            }
        } catch (error) {
            console.error('Error checking host status:', error);
            if (localStorage.getItem('user_is_host') === 'true') {
                setIsHost(true);
            } else {
                toast.error('Failed to verify host status');
                navigate('/host/benefits');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleManageTournaments = () => {
        navigate(`/host/manage?game=${activeGame}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!isHost) {
        return null;
    }

    const activeGameData = games.find(g => g.id === activeGame);

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black italic">Host Dashboard</h1>
                            <p className="text-zinc-400 text-sm mt-1">Manage your tournaments</p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    localStorage.removeItem('user_is_host');
                                    toast.success('Host status reset. You are now a user.');
                                    setTimeout(() => window.location.reload(), 1000);
                                }}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                title="Reset Host Status (Dev)"
                            >
                                <Shield size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/profile')}
                                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <Settings size={20} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Game Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    {games.map((game) => {
                        const Icon = game.icon;
                        const isActive = activeGame === game.id;

                        return (
                            <motion.button
                                key={game.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveGame(game.id)}
                                className={`relative px-6 py-4 rounded-2xl border-2 transition-all min-w-[140px] ${isActive
                                        ? 'border-white bg-gradient-to-br ' + game.color
                                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Icon className={isActive ? 'text-white' : 'text-zinc-400'} size={24} />
                                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                                        {game.name}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Hero Section */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeGameData?.color} p-12 mb-8`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black italic mb-2">{activeGameData?.name} Tournaments</h2>
                        <p className="text-white/80 mb-6">Create and manage tournaments for {activeGameData?.name}</p>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/host/create/${activeGame}`)}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-teal-500 to-emerald-500 text-black"
                            >
                                <Plus className="w-8 h-8 mb-3" />
                                <h3 className="font-black text-lg mb-1">Create Tournament</h3>
                                <p className="text-sm opacity-80">Launch a new event</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleManageTournaments}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <Trophy className="w-8 h-8 mb-3 text-zinc-400 group-hover:text-white transition-colors" />
                                <h3 className="font-black text-lg mb-1">Manage Tournaments</h3>
                                <p className="text-sm text-zinc-400">View and update</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/host/reports')}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <MessageSquare className="w-8 h-8 mb-3 text-zinc-400 group-hover:text-white transition-colors" />
                                <h3 className="font-black text-lg mb-1">Reports & Disputes</h3>
                                <p className="text-sm text-zinc-400">Player issues</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/host/wallet')}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <Wallet className="w-8 h-8 mb-3 text-zinc-400 group-hover:text-white transition-colors" />
                                <h3 className="font-black text-lg mb-1">Wallet & Earnings</h3>
                                <p className="text-sm text-zinc-400">Service fees earned</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <TrendingUp className="w-8 h-8 mb-3 text-zinc-400 group-hover:text-white transition-colors" />
                                <h3 className="font-black text-lg mb-1">Analytics</h3>
                                <p className="text-sm text-zinc-400">Coming soon</p>
                            </motion.button>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Active Tournaments"
                                value="0"
                                change="+0%"
                                icon={Trophy}
                            />
                            <StatCard
                                title="Total Players"
                                value="0"
                                change="+0%"
                                icon={Target}
                            />
                            <StatCard
                                title="Revenue"
                                value="₹0"
                                change="+0%"
                                icon={TrendingUp}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
