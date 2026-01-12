import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PredictionHeader from '@/components/prediction/PredictionHeader';
import GameModeSelector, { GameMode } from '@/components/prediction/GameModeSelector';
import TimerBoard from '@/components/prediction/TimerBoard';
import BettingControls from '@/components/prediction/BettingControls';
import GameHistory, { GameHistoryItem, UserHistoryItem } from '@/components/prediction/GameHistory';
import { toast, Toaster } from 'react-hot-toast';
import { ChevronRight, ShieldCheck, X, PartyPopper, TrendingDown, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useGameEngine } from '@/hooks/useGameEngine';

// API Configuration
// API Configuration
// Logic:
// 1. Prioritize VITE_API_URL if set (e.g. .env.development for local)
// 2. Fallback to production URL 'https://api.esporizon.in/api' if missing
// 3. This ensures production builds (where .env might be missing) still connect to the right place
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Production fallback
  API_URL = 'https://api.esporizon.in/api';
  console.log('Using production API URL:', API_URL);
} else {
  console.log('Using configured API URL:', API_URL);
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

  // 0️⃣ WALLET BALANCE FROM BACKEND (Server Authority)
  useEffect(() => {
    if (!user?.id) return;

    const fetchBalance = async () => {
      try {
        const response = await axios.get(`${API_URL}/wallet`, {
          headers: {
            'user-id': user.id  // Temporary until JWT is fully enforced
          }
        });
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Failed to fetch balance from backend:', error);
      }
    };

    // Fetch immediately
    fetchBalance();

    // Poll balance every 2 seconds for real-time updates (like real BDG game)
    const interval = setInterval(fetchBalance, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // 0.5️⃣ USER BETS FROM BACKEND (Real-time updates for "My Bets")
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserBets = async () => {
      try {
        const response = await axios.get(`${API_URL}/user-bets`, {
          params: { limit: 50 },
          headers: { 'user-id': user.id }
        });

        if (response.data.success) {
          const bets: UserHistoryItem[] = response.data.bets.map((bet: any) => ({
            id: bet.periodId + '-' + bet.timestamp,
            periodId: bet.periodId,
            selection: bet.value,
            amount: bet.amount,
            result: (bet.status === 'WON' ? 'Win' : bet.status === 'LOST' ? 'Lose' : 'Pending') as 'Win' | 'Lose' | 'Pending',
            payout: bet.payout || 0,
            createdAt: { toMillis: () => new Date(bet.timestamp).getTime() }
          }));

          setUserHistory(bets);
        }
      } catch (error) {
        console.error('Failed to fetch user bets from backend:', error);
      }
    };

    // Fetch immediately
    fetchUserBets();

    // Poll every 5 seconds for real-time bet history updates
    const interval = setInterval(fetchUserBets, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // 1️⃣ HISTORY FROM BACKEND (Server Authority)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Map frontend mode to backend gameType
        const gameTypeMap: Record<string, string> = {
          'WIN_GO_30S': '30s',
          'WIN_GO_1_MIN': '1m',
          'WIN_GO_3_MIN': '3m',
          'WIN_GO_5_MIN': '5m'
        };
        const gameType = gameTypeMap[currentModeId] || '1m';

        const response = await axios.get(`${API_URL}/history`, {
          params: { gameType, limit: 100 }
        });

        const historyItems: GameHistoryItem[] = response.data.map((item: any) => ({
          periodId: item.periodId,
          number: item.number,
          bigSmall: (item.bigSmall === 'BIG' ? 'Big' : 'Small') as 'Big' | 'Small',
          colors: getNumberColor(item.number),
          createdAt: { toMillis: () => new Date(item.time).getTime() }
        }));

        setGameHistory(historyItems);
      } catch (error) {
        console.error("Failed to fetch history from backend:", error);
      }
    };

    // Fetch immediately
    fetchHistory();

    // Refresh history every 10 seconds
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
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

      // Map frontend mode to backend gameType
      const gameTypeMap: Record<string, string> = {
        'WIN_GO_30S': '30s',
        'WIN_GO_1_MIN': '1m',
        'WIN_GO_3_MIN': '3m',
        'WIN_GO_5_MIN': '5m'
      };
      const gameType = gameTypeMap[currentModeId] || '1m';

      const response = await axios.post(`${API_URL}/predict/place-bet`, {
        gameType,           // Backend expects 'gameType' not 'mode'
        periodId,           // Add missing periodId
        betType,            // Same
        value: betValue,    // Backend expects 'value' not 'betValue'
        amount              // Backend expects 'amount' not 'betAmount'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'user-id': user?.id || 'anonymous'  // ✅ Add user-id header for backend
        }
      });

      // ✅ Update balance from server response immediately
      if (response.data.success && response.data.balance !== undefined) {
        setBalance(response.data.balance);
        console.log('✅ Balance updated after bet:', response.data.balance);
      }

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
        {/* Optimized Back Button - ESPORIZON Theme */}
        <button
          onClick={() => window.history.back()}
          className="px-3 py-2.5 hover:bg-[var(--accent)]/10 active:bg-[var(--accent)]/20 rounded-xl transition-all duration-200 border border-[var(--border)] hover:border-[var(--accent)]/30 group"
        >
          <ChevronRight className="rotate-180 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" size={22} />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[var(--accent)]" />
            ESPO WIN GO
          </h1>
        </div>
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
                  'Content-Type': 'application/json',
                  'user-id': user?.id || 'anonymous'  // ✅ Add user-id header for backend
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
                    <div>Red: <span className="font-bold text-[var(--accent)]">1.95x</span></div>
                    <div>Green: <span className="font-bold text-[var(--accent)]">1.95x</span></div>
                    <div>Violet: <span className="font-bold text-[var(--accent)]">1.5x</span></div>
                    <div>Big: <span className="font-bold text-[var(--accent)]">1.95x</span></div>
                    <div>Small: <span className="font-bold text-[var(--accent)]">1.95x</span></div>
                    <div>Any Number (0-9): <span className="font-bold text-[var(--accent)]">9x</span></div>
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
