import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/WalletService';
import PredictionHeader from '@/components/prediction/PredictionHeader';
import GameModeSelector, { GameMode } from '@/components/prediction/GameModeSelector';
import TimerBoard from '@/components/prediction/TimerBoard';
import BettingControls from '@/components/prediction/BettingControls';
import GameHistory, { GameHistoryItem, UserHistoryItem } from '@/components/prediction/GameHistory';
import { toast, Toaster } from 'react-hot-toast';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { db } from '@/services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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

// Simplify period ID for display (WG1-20260110-001 -> WG1-001)
const simplifyPeriodId = (periodId: string) => {
  const parts = periodId.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[2]}`; // WG1-001
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
  const [isLocked, setIsLocked] = useState(false);
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

  // Load Initial Balance
  useEffect(() => {
    const loadBalance = async () => {
      if (user?.id) {
        try {
          const wallet = await walletService.getWallet(user.id);
          if (wallet) setBalance(wallet.balance);
        } catch (e) {
          console.error(e);
          setBalance(6950);
        }
      }
    };
    loadBalance();
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
          setIsLocked(data.status === 'LOCKED');

          // Update result when available
          if (data.resultNumber >= 0) {
            setLastResult(data.resultNumber);

            // Add to history if this is a new result
            const historyItem: GameHistoryItem = {
              periodId: data.periodId,
              number: data.resultNumber,
              bigSmall: data.resultSize === 'BIG' ? 'Big' : 'Small',
              colors: getNumberColor(data.resultNumber)
            };

            setGameHistory(prev => {
              // Avoid duplicates
              if (prev[0]?.periodId === data.periodId) return prev;
              return [historyItem, ...prev].slice(0, 100);
            });

            // Process bets when result is available
            if (data.status === 'RESULT' && data.payoutDone) {
              processBets(data.resultNumber, data.periodId);
            }
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

  // 2️⃣ TIMER SYNC (roundEndAt - serverNow)
  useEffect(() => {
    if (!roundData) return;

    const updateTimer = () => {
      const now = Date.now();
      const roundEndMs = roundData.roundEndAt.seconds * 1000 + roundData.roundEndAt.nanoseconds / 1000000;
      const remainingMs = roundEndMs - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      // Update locked state based on remaining time
      if (roundData.status === 'LOCKED' || remainingSec <= 5) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => clearInterval(interval);
  }, [roundData]);

  // 3️⃣ MODE SWITCH HANDLER (Clean switch, no Firestore calls)
  const handleModeChange = (newMode: GameMode) => {
    setSelectedMode(newMode);
    setMode(MODE_MAP[newMode.id]); // Update Firestore listener

    // Reset local state for clean switch
    setTimeLeft(0);
    setPeriodId('');
    setIsLocked(false);
    setPendingBets([]); // Clear pending bets when switching modes
  };

  // Game Logic Handlers
  const processBets = (resultNum: number, periodFinished: string) => {
    const currentPending = pendingBetsRef.current;
    if (currentPending.length === 0) return;

    // Only process bets for the finished period
    const betsForThisPeriod = currentPending.filter(bet => bet.periodId === periodFinished);
    if (betsForThisPeriod.length === 0) return;

    const resultColors = getNumberColor(resultNum);
    const resultBigSmall = resultNum >= 5 ? 'Big' : 'Small';

    let totalWin = 0;
    const processedHistory: UserHistoryItem[] = betsForThisPeriod.map(bet => {
      let winAmount = 0;
      let isWin = false;

      if (!isNaN(parseInt(bet.selection))) {
        if (parseInt(bet.selection) === resultNum) {
          isWin = true;
          winAmount = bet.amount * 9;
        }
      }
      else if (bet.selection === 'Big' || bet.selection === 'Small') {
        if (bet.selection === resultBigSmall) {
          isWin = true;
          winAmount = bet.amount * 2;
        }
      }
      else {
        const isViolet = resultNum === 0 || resultNum === 5;
        const isRed = resultColors.includes('#EF4444');
        const isGreen = resultColors.includes('#22C55E');

        if (bet.selection === 'Violet' && isViolet) {
          isWin = true;
          winAmount = bet.amount * 4.5;
        } else if (bet.selection === 'Red' && isRed) {
          isWin = true;
          winAmount = bet.amount * 2;
          if (isViolet) winAmount = bet.amount * 1.5;
        } else if (bet.selection === 'Green' && isGreen) {
          isWin = true;
          winAmount = bet.amount * 2;
          if (isViolet) winAmount = bet.amount * 1.5;
        }
      }

      if (isWin) {
        totalWin += winAmount;
        return { ...bet, result: 'Win', payout: winAmount - bet.amount };
      } else {
        return { ...bet, result: 'Lose', payout: -bet.amount };
      }
    });

    if (totalWin > 0) {
      setBalance(prev => prev + totalWin);
      toast.success(`You won ${totalWin} Espo Coins!`);
      if (user?.id) {
        walletService.addFunds(totalWin, user.id).catch(console.error);
      }
    }

    setUserHistory(prev => [...processedHistory, ...prev].slice(0, 50));
    setPendingBets(prev => prev.filter(bet => bet.periodId !== periodFinished));
  };

  // 4️⃣ BETTING HANDLER (with status guards)
  const handlePlaceBet = (selection: string, amount: number) => {
    // Safety guard: Only allow betting when status is BETTING
    if (!roundData || roundData.status !== 'BETTING') {
      toast.error('Betting is currently closed!');
      return;
    }

    if (isLocked) {
      toast.error('Betting is locked for this round!');
      return;
    }

    if (balance < amount) {
      toast.error('Insufficient balance!');
      return;
    }

    setBalance(prev => prev - amount);
    if (user?.id) {
      walletService.deductFunds(amount, user.id).catch(console.error);
    }

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
          disabled={isLocked}
        />

        {/* Main Game Board */}
        <div className="space-y-6">
          {/* Timer & Recent Result */}
          <TimerBoard
            timeLeft={timeLeft}
            periodId={simplifyPeriodId(periodId)}
            isLocked={isLocked}
            lastResult={lastResult}
            modeLabel={selectedMode.label}
            onShowHowToPlay={() => toast('Select a color or number or Big/Small to bet!')}
          />

          {/* Betting Interface */}
          <BettingControls
            isLocked={isLocked || roundData?.status !== 'BETTING'}
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

