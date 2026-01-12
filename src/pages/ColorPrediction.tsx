import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PredictionHeader from '@/components/prediction/PredictionHeader';
import GameModeSelector, { GameMode } from '@/components/prediction/GameModeSelector';
import TimerBoard from '@/components/prediction/TimerBoard';
import BettingControls from '@/components/prediction/BettingControls';
import GameHistory, { GameHistoryItem, UserHistoryItem } from '@/components/prediction/GameHistory';
import { toast, Toaster } from 'react-hot-toast';
import { ChevronRight, ShieldCheck, X, PartyPopper, TrendingDown, BookOpen } from 'lucide-react';
import { db } from '@/services/firebase';
import { doc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import axios from 'axios';
import { useGameEngine } from '@/hooks/useGameEngine';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL is not configured!');
}



// Constants
const GAME_MODES: GameMode[] = [
  { id: '30s', label: 'Win Go 30s', duration: 30 },
  { id: '1min', label: 'Win Go 1 Min', duration: 60 },
  { id: '3min', label: 'Win Go 3 Min', duration: 180 },
  { id: '5min', label: 'Win Go 5 Min', duration: 300 },
];

// Map UI mode IDs to Firestore mode names
const MODE_MAP: Record<string, string> = {
  '30s': 'WIN_GO_30S',
  '1min': 'WIN_GO_1_MIN',
  '3min': 'WIN_GO_3_MIN',
  '5min': 'WIN_GO_5_MIN',
};

const getNumberColor = (num: number) => {
  if (num === 0) return ['#22C55E', '#8B5CF6'];
  if (num === 5) return ['#22C55E', '#EF4444'];
  if ([1, 3, 7, 9].includes(num)) return ['#22C55E'];
  return ['#EF4444'];
};

// Simplify period ID for display (WG1-20260110-001 -> 20260110001) for concise UI
const simplifyPeriodId = (periodId: string) => {
  if (!periodId) return 'Loading...';
  // If format is like "1m-1768174742991" (Timestamp based) or "WG1-2026..."
  // Just show the last 9-10 digits if it's long
  if (periodId.includes('-')) {
    const parts = periodId.split('-');
    return parts[parts.length - 1];
  }
  return periodId;
};

const ColorPrediction = () => {
  const { user, getToken } = useAuth();

  // Mode State
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODES[1]); // UI mode
  const currentModeId = MODE_MAP[selectedMode.id]; // Map to Firestore name (WIN_GO_1_MIN, etc.)

  // 🔄 Use the New Game Engine Hook (Replaces Firestore Round Logic)
  // CRITICAL: Must pass Firestore mode name (WIN_GO_1_MIN) not UI id ('1min')
  const { periodId, remainingSeconds, status, lastResult } = useGameEngine(currentModeId);

  // User State
  const [balance, setBalance] = useState(6950);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistoryItem[]>([]);

  // Modal States
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalType, setResultModalType] = useState<'win' | 'lose'>('win');
  const [resultAmount, setResultAmount] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Refs for tracking state inside intervals
  const lastProcessedResultRef = useRef<string>('');

  // 0️⃣ WALLET LISTENER (Backend Authority)
  useEffect(() => {
    if (!user?.id) return;
    const walletRef = doc(db, 'prediction_wallets', user.id);
    const unsubscribe = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBalance(data.balance || 0);
      } else {
        setBalance(0); // Default if no wallet yet
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 0.5️⃣ USER BETS LISTENER (Real-time updates for "My Bets")
  useEffect(() => {
    if (!user?.id) return;
    const q = query(
      collection(db, 'prediction_bets'),
      where('userId', '==', user.id),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bets: UserHistoryItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          periodId: data.periodId,
          selection: data.betValue,
          amount: data.betAmount,
          result: (data.status === 'won' ? 'Win' : data.status === 'lost' ? 'Lose' : 'Pending') as 'Win' | 'Lose' | 'Pending',
          payout: data.payout || 0,
          createdAt: data.createdAt
        };
      })
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

      setUserHistory(bets);
    }, (error) => {
      console.error('❌ User bets listener error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // 1️⃣ HISTORY LISTENER (Kept for instant updates on history list)
  useEffect(() => {
    const q = query(
      collection(db, 'prediction_history'),
      where('mode', '==', currentModeId),
      // Optional: filter by date if getTodayIST() is used for indexing
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const historyItems: GameHistoryItem[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          periodId: data.periodId,
          number: data.resultNumber,
          bigSmall: (data.resultSize === 'BIG' ? 'Big' : 'Small') as 'Big' | 'Small',
          colors: getNumberColor(data.resultNumber),
          createdAt: data.createdAt
        };
      })
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

      setGameHistory(historyItems);
    }, (err) => {
      console.error("History listener error:", err);
    });

    return () => unsubscribe();
  }, [currentModeId]);

  // 3️⃣ RESULT POPUP HANDLER
  useEffect(() => {
    if (lastResult && lastResult.periodId !== lastProcessedResultRef.current) {
      lastProcessedResultRef.current = lastResult.periodId;
      // Check if we battled in this period
      checkForResultPopup(lastResult.periodId);
    }
  }, [lastResult]);

  const checkMonitorRef = useRef(userHistory);
  useEffect(() => { checkMonitorRef.current = userHistory; }, [userHistory]);

  const checkForResultPopup = (completedPeriodId: string) => {
    // We need to wait a sec to ensure 'userHistory' is updated via Firestore listener
    // Or we rely on the fact that result generation (backend) happens -> Firestore update -> Client listener -> Then we check.

    // A slight delay to ensure the "won/lost" status has propagated to the bets collection
    setTimeout(() => {
      const bets = checkMonitorRef.current;
      const userBetsForPeriod = bets.filter(bet => bet.periodId === completedPeriodId);

      if (userBetsForPeriod.length === 0) return;

      const wonBets = userBetsForPeriod.filter(bet => bet.result === 'Win');

      if (wonBets.length > 0) {
        const totalWinnings = wonBets.reduce((sum, bet) => sum + bet.payout, 0);
        setResultAmount(totalWinnings);
        setResultModalType('win');
        setShowResultModal(true);
        toast.success(`You won! +${totalWinnings}`, { icon: '💰' });
      } else if (userBetsForPeriod.some(bet => bet.result === 'Lose')) {
        setResultModalType('lose');
        setShowResultModal(true);
      }
    }, 1500);
  };

  // 4️⃣ BETTING HANDLER (BACKEND API INTEGRATION)
  const handlePlaceBet = async (selection: string, amount: number) => {
    // ⚠️ CRITICAL: Betting allowed ONLY when Engine says status=BETTING
    if (status !== 'BETTING') {
      toast.error('Betting is stopped!');
      return;
    }

    if (balance < amount) {
      toast.error('Insufficient balance!');
      return;
    }

    // Determine bet type and value
    let betType: 'COLOR' | 'NUMBER' | 'SIZE';
    let betValue = selection.toUpperCase();

    if (['RED', 'GREEN', 'VIOLET'].includes(betValue)) {
      betType = 'COLOR';
    } else if (['BIG', 'SMALL'].includes(betValue)) {
      betType = 'SIZE';
    } else {
      betType = 'NUMBER';
    }

    try {
      const token = await getToken({ template: "firebase" });
      if (!token) throw new Error("JWT token missing");

      await axios.post(`${API_URL}/predict/place-bet`, {
        userId: user?.id,
        mode: currentModeId,
        betType,
        betValue,
        betAmount: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(`Bet placed: ${selection} - ${amount} coins`, { id: 'bet-success' });
    } catch (error: any) {
      console.error('Bet placement error:', error);
      toast.error(error.response?.data?.error || 'Failed to place bet');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 transition-colors duration-300 font-sans">
      <Toaster position="top-right" />

      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)] p-4 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-[var(--glass)] rounded-xl transition-all"
        >
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
          <ShieldCheck size={18} className="text-[var(--accent)]" />
          Combat Prediction
        </h1>
        <div className="w-10 h-10" />
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-6 space-y-6">

        {/* Header Component (Balance) */}
        <PredictionHeader
          balance={balance}
          onDeposit={async () => {
            try {
              const token = await getToken({ template: "firebase" });

              if (!token) {
                throw new Error("JWT token missing in deposit");
              }

              const response = await axios.post(`${API_URL}/predict/wallet/deposit`, {
                amount: 500
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.data.success) {
                setBalance(response.data.balance);
                toast.success(`Deposited: +₹500`);
              }
            } catch (error: any) {
              console.error('Deposit error:', error);
              toast.error(error.response?.data?.error || 'Failed to deposit');
            }
          }}
          onWithdraw={() => toast('Withdrawal coming soon')}
        />

        {/* Global Game Mode Selector */}
        <GameModeSelector
          modes={GAME_MODES}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          disabled={status === 'LOCKED' || status === 'RESULT_PENDING'}
        />

        {/* Main Game Board */}
        <div className="space-y-6">
          {/* Timer & Recent Result */}
          <TimerBoard
            timeLeft={remainingSeconds}
            periodId={simplifyPeriodId(periodId)}
            isLocked={status === 'LOCKED' || status === 'RESULT_PENDING'}
            lastResult={lastResult ? lastResult.number : (gameHistory[0]?.number ?? -1)}
            modeLabel={selectedMode.label}
            onShowHowToPlay={() => setShowGuideModal(true)}
          />

          {/* Betting Interface */}
          <BettingControls
            isLocked={status !== 'BETTING'}
            balance={balance}
            onPlaceBet={handlePlaceBet}
          />
        </div>

        {/* History & Charts */}
        <div className="pt-2">
          <GameHistory gameHistory={gameHistory} userHistory={userHistory} />
        </div>

      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResultModal(false)}>
          <div className="bg-[var(--glass)] border border-[var(--border)] rounded-3xl p-8 max-w-sm w-full text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowResultModal(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <X size={20} />
            </button>

            {resultModalType === 'win' ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                  <PartyPopper size={40} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Congratulations! 🎉</h2>
                <p className="text-[var(--text-secondary)] mb-4">You won this round!</p>
                <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-2xl p-4">
                  <div className="text-sm text-[var(--text-secondary)] mb-1">Total Winnings</div>
                  <div className="text-3xl font-black text-[var(--accent)]">+₹{resultAmount}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <TrendingDown size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Better Luck Next Time</h2>
                <p className="text-[var(--text-secondary)] mb-4">Keep trying, fortune favors the brave!</p>
              </>
            )}

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full mt-6 bg-[var(--accent)] text-[var(--bg-primary)] py-3 rounded-xl font-black uppercase tracking-wider hover:brightness-110 transition-all"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGuideModal(false)}>
          <div className="bg-[var(--glass)] border border-[var(--border)] rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowGuideModal(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">How to Play</h2>
            </div>

            <div className="space-y-6 text-[var(--text-secondary)]">
              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">🎯 Objective</h3>
                <p>Predict the winning number (0-9) by selecting a color, specific number, or size (Big/Small).</p>
              </section>

              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">🎨 Color Rules</h3>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><span className="font-bold text-green-500">Green:</span> Numbers 1, 3, 7, 9 (Also 0 and 5)</li>
                  <li><span className="font-bold text-red-500">Red:</span> Numbers 2, 4, 6, 8 (Also 0 and 5)</li>
                  <li><span className="font-bold text-violet-500">Violet:</span> Numbers 0 and 5 only</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">📏 Size Rules</h3>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><span className="font-bold text-orange-400">Big:</span> Numbers 5-9</li>
                  <li><span className="font-bold text-blue-400">Small:</span> Numbers 0-4</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">💰 Payout Multipliers</h3>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Red: <span className="font-bold text-[var(--accent)]">1.9x</span></div>
                    <div>Green: <span className="font-bold text-[var(--accent)]">1.9x</span></div>
                    <div>Violet: <span className="font-bold text-[var(--accent)]">1.5x</span></div>
                    <div>Big: <span className="font-bold text-[var(--accent)]">1.9x</span></div>
                    <div>Small: <span className="font-bold text-[var(--accent)]">1.9x</span></div>
                    <div>Any Number (0-9): <span className="font-bold text-[var(--accent)]">8x</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">⚖️ Bet Limits</h3>
                <p>Minimum: <span className="font-bold">₹5</span> | Maximum: <span className="font-bold">₹100,000</span></p>
              </section>

              <section>
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">⏱️ Timing</h3>
                <p>Betting closes in the <span className="font-bold text-red-500">last 5 seconds</span> of each round. Place your bets early!</p>
              </section>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full mt-6 bg-[var(--accent)] text-[var(--bg-primary)] py-3 rounded-xl font-black uppercase tracking-wider hover:brightness-110 transition-all"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPrediction;
