import { ArrowLeft, DollarSign, Shield, Wrench, Star, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { hostService } from '@/services/HostService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const HostBenefits = () => {
    const navigate = useNavigate();
    const { updateUserHostStatus } = useAuth();
    const [activating, setActivating] = useState(false);

    const handleBecomeHost = async () => {
        setActivating(true);
        try {
            const result = await hostService.activateHost();

            if (result.success) {
                // Update user status locally
                updateUserHostStatus(true);
                toast.success('🎉 You are now a verified host!');
                // Redirect to host dashboard
                navigate('/host/dashboard');
            } else {
                toast.error(result.message || 'Failed to activate host status');
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Host activation error:', error);

            }
            toast.error('Something went wrong. Please try again.');
        } finally {
            setActivating(false);
        }
    };

    const benefits = [
        {
            id: '1',
            icon: <DollarSign className="w-5 h-5" />,
            title: 'Earn Commission',
            description: 'Receive transparent commission for every tournament you organize'
        },
        {
            id: '2',
            icon: <Shield className="w-5 h-5" />,
            title: 'Admin Verification',
            description: 'Admin-supported matches with verified results and fair play monitoring'
        },
        {
            id: '3',
            icon: <Wrench className="w-5 h-5" />,
            title: 'Hosting Tools',
            description: 'Access professional tournament management dashboard and automation'
        },
        {
            id: '4',
            icon: <Star className="w-5 h-5" />,
            title: 'Build Reputation',
            description: 'Grow your trust score and community standing through quality hosting'
        },
        {
            id: '5',
            icon: <Headphones className="w-5 h-5" />,
            title: 'Priority Support',
            description: 'Get dedicated support for dispute resolution and technical issues'
        }
    ];

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background Atmosphere Layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] opacity-30" />
            </div>

            {/* Content */}
            <div className="relative px-5 pt-8 pb-6 z-10">
                <button
                    onClick={() => navigate('/arena/freefire')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Back to Arena</span>
                </button>

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none mb-3">
                        VERIFIED HOST<span className="text-teal-500 italic text-5xl">.</span>
                    </h1>
                    <p className="text-xs text-zinc-400 font-bold tracking-wide leading-relaxed max-w-[280px]">
                        RUN COMPETITIVE TOURNAMENTS. EARN RESPONSIBLY. BUILD REPUTATION.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="space-y-4 mb-10">
                    {benefits.map((benefit, idx) => (
                        <div
                            key={benefit.id}
                            className={`group relative rounded-2xl bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-5 shadow-2xl hover:border-teal-500/30 transition-all animate-fadeIn delay-${(idx + 1) * 100}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                    <div className="text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]">
                                        {benefit.icon}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[13px] font-black text-white mb-1.5 uppercase tracking-wider italic">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="animate-float-subtle">
                    <button
                        onClick={handleBecomeHost}
                        disabled={activating}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl px-6 py-5 shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="relative flex items-center justify-center gap-3">
                            <span className="text-sm font-black tracking-[0.3em] text-black">
                                {activating ? 'ACTIVATING...' : 'BECOME A HOST (FREE)'}
                            </span>
                            {!activating && <div className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HostBenefits;
