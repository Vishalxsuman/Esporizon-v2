import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// walletService removed (unused)
import PredictionHeader from '@/components/prediction/PredictionHeader';
import GameModeSelector, { GameMode } from '@/components/prediction/GameModeSelector';
import TimerBoard from '@/components/prediction/TimerBoard';
import BettingControls from '@/components/prediction/BettingControls';
import GameHistory, { GameHistoryItem, UserHistoryItem } from '@/components/prediction/GameHistory';
import { toast, Toaster } from 'react-hot-toast';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { db } from '@/services/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

// Helper for IST date (YYYY-MM-DD)
const getTodayIST = () => {
  return new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString().slice(0, 10);
};

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
  const parts = periodId.split('-');
  if (parts.length === 3) {
    return `${parts[1]}${parts[2]}`; // 20260110001
  }
  return periodId;
};

interface RoundData {
  mode: string;
  periodId: string;
  status: 'BETTING' | 'LOCKED' | 'RESULT';
  roundStartAt: { seconds: number; nanoseconds: number };
  roundEndAt: { seconds: number; nanoseconds: number };
  resultNumber: number;
  resultColor: string;
  resultSize: string;
  payoutDone: boolean;
}

const ColorPrediction = () => {
  const { user } = useAuth();

  // Mode State (CRITICAL: drives Firestore listener)
  const [mode, setMode] = useState<string>('WIN_GO_1_MIN'); // Firestore mode name
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODES[1]); // UI mode

  // Round Data from Firestore
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [periodId, setPeriodId] = useState('');
  const [lastResult, setLastResult] = useState(-1);

  // User State
  const [balance, setBalance] = useState(6950);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistoryItem[]>([]);
  const [pendingBets, setPendingBets] = useState<UserHistoryItem[]>([]);

  // Refs for tracking state inside intervals
  const pendingBetsRef = useRef(pendingBets);

  useEffect(() => {
    pendingBetsRef.current = pendingBets;
  }, [pendingBets]);

  // 0️⃣ WALLET LISTENER (Backend Authority)
  useEffect(() => {
    if (!user?.id) return;

    // Listen to prediction_wallets (Backend is source of truth)
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

  // 0.5️⃣ USER BETS LISTENER (Real-time updates)
  useEffect(() => {
    if (!user?.id) return;

    // Listen to MY bets (ordered by newest)
    const q = query(
      collection(db, 'prediction_bets'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bets: UserHistoryItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          periodId: data.periodId,
          selection: data.betValue, // Map betValue to selection
          amount: data.betAmount,
          result: data.status === 'won' ? 'Win' : data.status === 'lost' ? 'Lose' : 'Pending',
          payout: data.payout || 0,
          createdAt: data.createdAt
        };
      });

      setUserHistory(bets);
      setPendingBets(bets.filter(b => b.result === 'Pending'));

      // Check for recent wins (Toast Notification)
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.status === 'won') {
            toast.success(`You won! +${data.payout}`, { icon: '💰' });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  // 1️⃣ MODE-BASED FIRESTORE LISTENER (CRITICAL)
  useEffect(() => {
    console.log(`🔥 Subscribing to Firestore: prediction_rounds/${mode}`);

    const roundRef = doc(db, 'prediction_rounds', mode);

    const unsubscribe = onSnapshot(
      roundRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as RoundData;
          console.log(`✅ Firestore snapshot for ${mode}:`, data);

          setRoundData(data);
          setPeriodId(data.periodId);

          // Update result for timer board display
          if (data.resultNumber >= 0) {
            setLastResult(data.resultNumber);
          }

          // Process bets when result is available and payout is done
          if (data.status === 'RESULT' && data.payoutDone) {
            console.log(`💰 [${mode}] Payout detected for ${data.periodId}. Processing UI updates...`);
            // processBets removed. Listener handles updates.

          }

        } else {
          console.warn(`⚠️ No document found for ${mode}`);
        }
      },
      (error) => {
        console.error(`❌ Firestore error for ${mode}:`, error);
      }
    );

    // Cleanup: unsubscribe when mode changes
    return () => {
      console.log(`🛑 Unsubscribing from ${mode}`);
      unsubscribe();
    };
  }, [mode]); // Re-run when mode changes

  // 1.5️⃣ PERSISTENT HISTORY LISTENER (NEW)
  useEffect(() => {
    const today = getTodayIST();
    console.log(`📜 Loading history for ${mode} on ${today}`);

    const q = query(
      collection(db, 'prediction_history'),
      where('mode', '==', mode),
      where('date', '==', today),
      orderBy('createdAt', 'desc'), // Fix: Order by latest
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
        // Sort locally to avoid index requirement
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

      setGameHistory(historyItems);

      // Set initial lastResult from most recent history item if exists
      if (historyItems.length > 0) {
        setLastResult(historyItems[0].number);
      }
    }, (err) => {
      console.error("History listener error:", err);
    });

    return () => unsubscribe();
  }, [mode]);

  // 2️⃣ TIMER CALCULATION (VISUAL ONLY - NOT FOR LOGIC)
  useEffect(() => {
    if (!roundData || !roundData.roundEndAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const roundEndMs = roundData.roundEndAt.seconds * 1000 + roundData.roundEndAt.nanoseconds / 1000000;
      const remainingMs = roundEndMs - now;
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

      setTimeLeft(remainingSec);

      // Debug log (visual timer only)
      if (remainingSec % 10 === 0 || remainingSec <= 5) {
        console.log(`⏱️ [${mode}] Timer: ${remainingSec}s, Status: ${roundData.status}`);
      }
    };

    // Update every 500ms for smooth countdown
    const interval = setInterval(updateTimer, 500);
    updateTimer(); // Initial call

    return () => clearInterval(interval);
  }, [roundData, mode]);

  // 3️⃣ MODE SWITCH HANDLER (Clean switch, no Firestore calls)
  const handleModeChange = (newMode: GameMode) => {
    setSelectedMode(newMode);
    setMode(MODE_MAP[newMode.id]); // Update Firestore listener

    // Reset local state for clean switch
    setTimeLeft(0);
    setPeriodId('');
    setLastResult(-1);
    setPendingBets([]); // Clear pending bets when switching modes
  };

  // 3.5 REMOVED: processBets (Client-side logic removed. Relying on Backend Listener)
  // Logic moved to server/services/predictionPayoutService.js



  // 4️⃣ BETTING HANDLER (STATUS-BASED - SERVERAUTHORITATIVE)
  const handlePlaceBet = (selection: string, amount: number) => {
    // ⚠️ CRITICAL: Betting allowed ONLY when server says status=BETTING
    if (!roundData || roundData.status !== 'BETTING') {
      toast.error('Betting is currently closed!');
      console.log(`🚫 Bet blocked: status=${roundData?.status}, required=BETTING`);
      return;
    }

    if (balance < amount) {
      toast.error('Insufficient balance!');
      return;
    }

    console.log(`✅ Bet placed: ${selection} for ${amount} coins (period: ${periodId})`);

    setBalance(prev => prev - amount);
    // Backend will update true balance via listener, but we update optimistic immediately
    // Note: Removed walletService.deductFunds calls because Backend validates and deducts


    const newBet: UserHistoryItem = {
      periodId: periodId,
      selection,
      amount,
      result: 'Pending',
      payout: 0
    };

    setPendingBets(prev => [...prev, newBet]);
    setUserHistory(prev => [newBet, ...prev]);
    toast.success(`Bet placed: ${selection} - ${amount} coins`);
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
          onDeposit={() => {
            setBalance(b => b + 1000);
            toast.success('Mock Deposit: +1000');
          }}
          onWithdraw={() => toast('Withdrawal coming soon')}
        />

        {/* Global Game Mode Selector */}
        <GameModeSelector
          modes={GAME_MODES}
          selectedMode={selectedMode}
          onSelectMode={handleModeChange}
          disabled={roundData?.status === 'LOCKED'}
        />

        {/* Main Game Board */}
        <div className="space-y-6">
          {/* Timer & Recent Result */}
          <TimerBoard
            timeLeft={timeLeft}
            periodId={simplifyPeriodId(periodId)}
            isLocked={roundData?.status === 'LOCKED'}
            lastResult={lastResult}
            modeLabel={selectedMode.label}
            onShowHowToPlay={() => toast('Select a color or number or Big/Small to bet!')}
          />

          {/* Betting Interface */}
          <BettingControls
            isLocked={roundData?.status !== 'BETTING'}
            balance={balance}
            onPlaceBet={handlePlaceBet}
          />
        </div>

        {/* History & Charts */}
        <div className="pt-2">
          <GameHistory gameHistory={gameHistory} userHistory={userHistory} />
        </div>

      </div>
    </div>
  );
};

export default ColorPrediction;

