import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, TrendingUp, Download, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../services/WalletService';
import { useAuth } from '../contexts/AuthContext';


interface Transaction {
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    status: string;
}

const HostWallet = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [transactions, _setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            const walletData = await walletService.getWallet(user.uid);
            setBalance(walletData.balance || 0);
            setTotalEarned(walletData.espoCoins || 0);

            // Transactions fetch omitted as it's handled by internal polling or separate endpoint
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('Wallet data unavailable:', error);

            }
            // Use defaults - balance already set to 0
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'service_fee':
                return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'deposit':
                return <Download className="w-5 h-5 text-blue-500" />;
            default:
                return <DollarSign className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/host/dashboard')}
                        className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic">Host Wallet</h1>
                        <p className="text-zinc-400 text-sm">Your earnings and balances</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Balance Cards */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Current Balance */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 p-8 rounded-2xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-teal-500/20 rounded-xl">
                                        <Wallet className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <span className="text-sm font-bold text-teal-400">CURRENT BALANCE</span>
                                </div>
                                <div className="text-4xl font-black mb-2">₹{balance.toLocaleString()}</div>
                                <p className="text-xs text-zinc-400">Available for withdrawal</p>
                            </motion.div>

                            {/* Total Earned */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 p-8 rounded-2xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-orange-500/20 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <span className="text-sm font-bold text-orange-400">TOTAL EARNED</span>
                                </div>
                                <div className="text-4xl font-black mb-2">₹{totalEarned.toLocaleString()}</div>
                                <p className="text-xs text-zinc-400">From tournament service fees</p>
                            </motion.div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                            <h3 className="font-bold mb-2 text-blue-400">How Host Earnings Work</h3>
                            <div className="text-sm text-zinc-300 space-y-2">
                                <p>• You earn a <span className="font-bold text-orange-400">2% platform service fee</span> from every completed tournament</p>
                                <p>• Fees are automatically credited to your wallet when results are published</p>
                                <p>• 98% of the prize pool is distributed to winning players</p>
                                <p>• Withdraw earnings anytime once minimum threshold is reached</p>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
                            {transactions.length === 0 ? (
                                <div className="text-center py-10 text-zinc-500">
                                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>No transactions yet</p>
                                    <p className="text-xs mt-1">Earnings will appear here after completing tournaments</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map((txn, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getTransactionIcon(txn.type)}
                                                <div>
                                                    <div className="font-bold text-sm">{txn.description}</div>
                                                    <div className="text-xs text-zinc-500">
                                                        {new Date(txn.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Withdraw Button (Placeholder) */}
                        <div className="mt-6">
                            <button
                                disabled={balance < 500}
                                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {balance < 500 ? 'Minimum ₹500 required for withdrawal' : 'Withdraw Funds'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HostWallet;
