import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Shield, Trophy } from 'lucide-react';

const SubscriptionBenefits = () => {
    const navigate = useNavigate();

    const handleSubscribe = () => {
        navigate('/host/subscribe');
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black italic mb-4">
                        BECOME A <span className="text-teal-500">HOST</span>
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Create tournaments, build your community, and earn rewards.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <BenefitItem icon={Trophy} title="Create Tournaments" desc="Host unlimited tournaments for any game" />
                        <BenefitItem icon={Zap} title="Instant Payouts" desc="Automated prize distribution system" />
                        <BenefitItem icon={Crown} title="Verification Badge" desc="Get the verified host badge on your profile" />
                        <BenefitItem icon={Shield} title="AI Anti-Cheat" desc="Automated result verification" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-8 mb-12 max-w-md mx-auto relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10">
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-5xl font-black text-white italic">FREE</span>
                                <span className="text-zinc-500 font-bold uppercase tracking-wider text-sm">/ Limited Time</span>
                            </div>
                            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-8">Early Access Host Program</p>

                            <ul className="space-y-4 text-left mb-8">
                                <li className="flex items-center gap-2">
                                    <Check className="text-teal-500" size={20} />
                                    <span>Unlimited Tournaments</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="text-teal-500" size={20} />
                                    <span>Priority Support</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="text-teal-500" size={20} />
                                    <span>Advanced Analytics</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black text-lg rounded-xl transition-colors"
                            >
                                ACTIVATE NOW
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const BenefitItem = ({ icon: Icon, title, desc }: any) => (
    <div className="flex items-start gap-4">
        <div className="p-3 bg-zinc-900 rounded-xl border border-white/10">
            <Icon className="text-teal-500" size={24} />
        </div>
        <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-zinc-400">{desc}</p>
        </div>
    </div>
);

export default SubscriptionBenefits;
