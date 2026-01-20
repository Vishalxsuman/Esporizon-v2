import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { subscriptionService } from '../services/SubscriptionService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const HostSubscriptionPurchase = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const processSubscription = async () => {
            try {
                // Simulate processing delay for better UX
                await new Promise(resolve => setTimeout(resolve, 2000));

                await subscriptionService.activateSubscription();
                localStorage.setItem('user_is_host', 'true');
                setStatus('success');
                toast.success('Subscription activated successfully!');

                // Redirect after success message
                setTimeout(() => {
                    navigate('/host/dashboard');
                }, 1500);
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Subscription error:', error);

                }
                setStatus('error');
                toast.error('Failed to activate subscription. Please try again.');
            }
        };

        processSubscription();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-cyber-grid text-center">
            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {status === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
                        <p className="text-zinc-400">Please wait while we activate your host account...</p>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
                        <p className="text-zinc-400">You are now a verified Host. Redirecting to dashboard...</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Activation Failed</h2>
                        <p className="text-zinc-400 mb-6">Something went wrong. Please try again.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HostSubscriptionPurchase;
