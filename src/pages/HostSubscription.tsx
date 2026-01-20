import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { subscriptionService } from '@/services/SubscriptionService';
import toast, { Toaster } from 'react-hot-toast';

const HostSubscription = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBecomeHost = async () => {
        setIsProcessing(true);
        try {
            await subscriptionService.activateSubscription();
            toast.success('Subscription activated successfully!');
            setTimeout(() => {
                navigate('/arena/host-dashboard');
            }, 1000);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Subscription failed:', error);

            }
            toast.error('Failed to activate subscription. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const planFeatures = [
        'Unlimited tournament creation',
        'Host earnings (commission-based)',
        'Admin verification & support',
        'Host dashboard access',
        'Priority dispute resolution',
        'Performance analytics'
    ];

    return (
        <div className="min-h-screen bg-black pb-24 animate-fadeIn bg-cyber-grid bg-fixed overflow-x-hidden">
            {/* Background Atmosphere Layers */}
            <Toaster position="top-center" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[100px] opacity-30" />
            </div>

            {/* Content */}
            <div className="relative px-5 pt-8 pb-6 z-10">
                <button
                    onClick={() => navigate('/arena/freefire/host-benefits')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-7 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Back to Benefits</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none mb-3">
                        HOST PLAN<span className="text-teal-500 italic text-5xl">.</span>
                    </h1>
                    <p className="text-xs text-zinc-400 font-bold tracking-wide leading-relaxed max-w-[280px]">
                        FOR PLAYERS WHO WANT TO LEAD COMPETITIVE COMMUNITIES.
                    </p>
                </div>

                {/* Subscription Card - Premium Glass */}
                <div className="relative rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-1 shadow-2xl mb-8 group overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-teal-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="bg-zinc-950/40 rounded-[2.2rem] border border-white/5 p-8 relative z-10">
                        {/* Plan Header */}
                        <div className="mb-8">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-black text-white italic tracking-tighter">₹999</span>
                                <span className="text-teal-500/60 font-black text-xs uppercase tracking-[0.2em]">/month</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    MONTHLY SUBSCRIPTION • CANCEL ANYTIME
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 mb-8"></div>

                        {/* What's Included */}
                        <div className="mb-4">
                            <h3 className="text-[10px] font-black text-teal-400/80 uppercase tracking-[0.3em] mb-6">
                                BATTLEGROUND PERKS
                            </h3>
                            <div className="grid gap-5">
                                {planFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-4 group/item">
                                        <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                                            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-300 leading-relaxed uppercase tracking-wide group-hover/item:text-white transition-colors pt-0.5">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Strip */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 mb-10 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/40" />
                    <p className="text-[10px] text-zinc-400 font-bold leading-relaxed tracking-wide uppercase italic">
                        HOSTING ON ESPORIZON IS ABOUT RESPONSIBILITY. WE ENABLE GENUINE PLAYERS TO ORGANIZE FAIR COMPETITIONS, EARN TRANSPARENTLY, AND GROW TRUSTED COMMUNITIES.
                    </p>
                </div>

                {/* CTA Section */}
                <div className="space-y-4">
                    <button
                        onClick={handleBecomeHost}
                        disabled={isProcessing}
                        className="w-full relative group overflow-hidden bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/30 disabled:cursor-not-allowed rounded-2xl px-6 py-5 shadow-[0_0_30px_rgba(20,184,166,0.2)] transition-all active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative text-sm font-black tracking-[0.3em] text-black">
                            {isProcessing ? 'INITIALIZING...' : 'BECOME A HOST'}
                        </span>
                    </button>

                    <p className="text-[9px] font-black text-center text-zinc-600 tracking-widest uppercase">
                        ELIGIBILITY AND FAIR-PLAY CHECKS APPLY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HostSubscription;
