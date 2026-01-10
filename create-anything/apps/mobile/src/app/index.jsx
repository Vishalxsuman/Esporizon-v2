import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  HelpCircle,
  X,
  TrendingUp,
  History,
  BarChart3,
  Clock,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// Game mode configurations
const GAME_MODES = [
  { id: "30s", label: "Win Go 30s", duration: 30 },
  { id: "1min", label: "Win Go 1 Min", duration: 60 },
  { id: "3min", label: "Win Go 3 Min", duration: 180 },
  { id: "5min", label: "Win Go 5 Min", duration: 300 },
];

// Color mappings for numbers
const getNumberColor = (num) => {
  if (num === 0) return ["#22C55E", "#8B5CF6"]; // Green + Violet
  if (num === 5) return ["#22C55E", "#EF4444"]; // Green + Red
  if ([1, 3, 7, 9].includes(num)) return ["#22C55E"]; // Green
  return ["#EF4444"]; // Red (2, 4, 6, 8)
};

// Generate mock period ID
const generatePeriodId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${dateStr}${randomNum}`;
};

// Generate mock history
const generateMockHistory = (count = 20) => {
  const history = [];
  for (let i = 0; i < count; i++) {
    const number = Math.floor(Math.random() * 10);
    history.push({
      periodId: generatePeriodId(),
      number,
      bigSmall: number >= 5 ? "Big" : "Small",
      colors: getNumberColor(number),
    });
  }
  return history;
};

// Generate mock user history
const generateMockUserHistory = (count = 10) => {
  const history = [];
  const selections = [
    "Red",
    "Green",
    "Violet",
    "Big",
    "Small",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  for (let i = 0; i < count; i++) {
    const betAmount = [10, 50, 100, 250, 500][Math.floor(Math.random() * 5)];
    const isWin = Math.random() > 0.5;
    const multiplier = [2, 4.5, 9][Math.floor(Math.random() * 3)];
    history.push({
      periodId: generatePeriodId(),
      selection: selections[Math.floor(Math.random() * selections.length)],
      amount: betAmount,
      result: isWin ? "Win" : "Lose",
      payout: isWin ? betAmount * multiplier : -betAmount,
    });
  }
  return history;
};

export default function ColourPredictionGame() {
  const insets = useSafeAreaInsets();

  // Game state
  const [selectedMode, setSelectedMode] = useState(GAME_MODES[0]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [periodId, setPeriodId] = useState(generatePeriodId());
  const [lastResult, setLastResult] = useState(7);
  const [isLocked, setIsLocked] = useState(false);

  // Betting state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedBigSmall, setSelectedBigSmall] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState(5000);

  // UI state
  const [activeTab, setActiveTab] = useState("history");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // History state
  const [gameHistory, setGameHistory] = useState(() => generateMockHistory(20));
  const [userHistory, setUserHistory] = useState(() =>
    generateMockUserHistory(10),
  );

  // Animations
  const resultScale = useRef(new Animated.Value(1)).current;
  const resultRotate = useRef(new Animated.Value(0)).current;

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Round ended
          handleRoundEnd();
          return selectedMode.duration;
        }
        // Lock betting in last 5 seconds
        if (prev <= 6 && !isLocked) {
          setIsLocked(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedMode, isLocked]);

  // Handle round end
  const handleRoundEnd = useCallback(() => {
    const newResult = Math.floor(Math.random() * 10);

    // Animate result
    Animated.sequence([
      Animated.timing(resultScale, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(resultScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(resultRotate, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      resultRotate.setValue(0);
    });

    setLastResult(newResult);
    setPeriodId(generatePeriodId());
    setIsLocked(false);

    // Add to history
    setGameHistory((prev) => [
      {
        periodId,
        number: newResult,
        bigSmall: newResult >= 5 ? "Big" : "Small",
        colors: getNumberColor(newResult),
      },
      ...prev.slice(0, 99),
    ]);

    // Reset selections
    setSelectedColor(null);
    setSelectedNumber(null);
    setSelectedBigSmall(null);
  }, [periodId, resultScale, resultRotate]);

  // Change game mode
  const handleModeChange = (mode) => {
    Haptics.selectionAsync();
    setSelectedMode(mode);
    setTimeLeft(mode.duration);
    setPeriodId(generatePeriodId());
    setIsLocked(false);
    setSelectedColor(null);
    setSelectedNumber(null);
    setSelectedBigSmall(null);
  };

  // Handle bet selection
  const handleColorSelect = (color) => {
    if (isLocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(color);
    setSelectedNumber(null);
    setSelectedBigSmall(null);
  };

  const handleNumberSelect = (number) => {
    if (isLocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNumber(number);
    setSelectedColor(null);
    setSelectedBigSmall(null);
  };

  const handleBigSmallSelect = (value) => {
    if (isLocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBigSmall(value);
    setSelectedColor(null);
    setSelectedNumber(null);
  };

  // Quick bet multipliers
  const handleQuickBet = (multiplier) => {
    const currentAmount = parseInt(betAmount) || 10;
    setBetAmount((currentAmount * multiplier).toString());
  };

  // Confirm bet
  const handleConfirm = () => {
    const amount = parseInt(betAmount) || 0;
    const hasSelection =
      selectedColor || selectedNumber !== null || selectedBigSmall;

    if (!hasSelection) {
      showToastMessage("Please select a prediction");
      return;
    }

    if (amount <= 0) {
      showToastMessage("Please enter a valid amount");
      return;
    }

    if (amount > balance) {
      showToastMessage("Insufficient balance");
      return;
    }

    if (isLocked) {
      showToastMessage("Betting is locked");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBalance((prev) => prev - amount);

    // Add to user history
    let selection = "";
    if (selectedColor) selection = selectedColor;
    else if (selectedNumber !== null) selection = selectedNumber.toString();
    else if (selectedBigSmall) selection = selectedBigSmall;

    setUserHistory((prev) => [
      {
        periodId,
        selection,
        amount,
        result: "Pending",
        payout: 0,
      },
      ...prev.slice(0, 99),
    ]);

    showToastMessage("Prediction submitted!");
    setBetAmount("");
    setSelectedColor(null);
    setSelectedNumber(null);
    setSelectedBigSmall(null);
  };

  // Toast helper
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert Espo Coin to INR
  const toINR = (espo) => {
    return (espo / 2.5).toFixed(2);
  };

  const rotateInterpolate = resultRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F1A" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Wallet */}
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16 }}>
          {/* Wallet Card */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Wallet size={20} color="#FFD700" />
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                Wallet Balance
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{ color: "#FFD700", fontSize: 28, fontWeight: "700" }}
                >
                  {balance.toLocaleString()}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Espo Coin ≈ ₹{toINR(balance)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#EF4444",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                  onPress={() => showToastMessage("Withdraw coming soon")}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ArrowUpCircle size={16} color="#fff" />
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                    >
                      Withdraw
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#22C55E",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    setBalance((prev) => prev + 1000);
                    showToastMessage("+1000 Espo Coin added!");
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ArrowDownCircle size={16} color="#fff" />
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                    >
                      Deposit
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Game Mode Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 16, flexGrow: 0 }}
            contentContainerStyle={{ gap: 10 }}
          >
            {GAME_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                onPress={() => handleModeChange(mode)}
                style={{
                  backgroundColor:
                    selectedMode.id === mode.id
                      ? "#6366F1"
                      : "rgba(255,255,255,0.08)",
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    selectedMode.id === mode.id
                      ? "#6366F1"
                      : "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedMode.id === mode.id
                        ? "#fff"
                        : "rgba(255,255,255,0.7)",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Round Info Panel */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
                {selectedMode.label}
              </Text>
              <TouchableOpacity
                onPress={() => setShowHowToPlay(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(99,102,241,0.2)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <HelpCircle size={14} color="#6366F1" />
                <Text
                  style={{
                    color: "#6366F1",
                    fontSize: 12,
                    marginLeft: 4,
                    fontWeight: "500",
                  }}
                >
                  How to play
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", marginTop: 16 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Clock size={18} color="#FFD700" />
                <Text
                  style={{ color: "#FFD700", fontSize: 12, fontWeight: "500" }}
                >
                  Time Remaining
                </Text>
              </View>
              <Text
                style={{
                  color: isLocked ? "#EF4444" : "#fff",
                  fontSize: 42,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                  marginTop: 4,
                }}
              >
                {formatTime(timeLeft)}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Period: {periodId}
              </Text>
              {isLocked && (
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  ⚠️ Betting Locked
                </Text>
              )}
            </View>
          </View>

          {/* Result Number Display */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              Last Result
            </Text>
            <Animated.View
              style={{
                transform: [
                  { scale: resultScale },
                  { rotateY: rotateInterpolate },
                ],
                flexDirection: "row",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 90,
                  backgroundColor: getNumberColor(lastResult)[0],
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: getNumberColor(lastResult)[0],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 48, fontWeight: "800" }}
                >
                  {lastResult}
                </Text>
              </View>
              {getNumberColor(lastResult).length > 1 && (
                <View
                  style={{
                    width: 70,
                    height: 90,
                    backgroundColor: getNumberColor(lastResult)[1],
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: getNumberColor(lastResult)[1],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 48, fontWeight: "800" }}
                  >
                    {lastResult}
                  </Text>
                </View>
              )}
            </Animated.View>
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {lastResult >= 5 ? "Big" : "Small"}
            </Text>
          </View>

          {/* Colour Selection Panel */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Select Colour
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { color: "Green", hex: "#22C55E", multiplier: "×2" },
                { color: "Violet", hex: "#8B5CF6", multiplier: "×4.5" },
                { color: "Red", hex: "#EF4444", multiplier: "×2" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.color}
                  onPress={() => handleColorSelect(item.color)}
                  disabled={isLocked}
                  style={{
                    flex: 1,
                    backgroundColor: item.hex,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: isLocked ? 0.5 : 1,
                    borderWidth: selectedColor === item.color ? 3 : 0,
                    borderColor: "#FFD700",
                    transform: [
                      { scale: selectedColor === item.color ? 1.02 : 1 },
                    ],
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    {item.color}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {item.multiplier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Number Selection Grid */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Select Number
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const colors = getNumberColor(num);
                const isSelected = selectedNumber === num;
                return (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handleNumberSelect(num)}
                    disabled={isLocked}
                    style={{
                      width: (width - 32 - 40) / 5,
                      aspectRatio: 1,
                      borderRadius: 100,
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: isLocked ? 0.5 : 1,
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: "#FFD700",
                      background:
                        colors.length > 1
                          ? `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`
                          : colors[0],
                      backgroundColor: colors[0],
                      overflow: "hidden",
                    }}
                  >
                    {colors.length > 1 && (
                      <View
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: "50%",
                          backgroundColor: colors[1],
                        }}
                      />
                    )}
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: "700",
                        zIndex: 1,
                      }}
                    >
                      {num}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 10,
                        zIndex: 1,
                      }}
                    >
                      ×9
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Big / Small Section */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Big / Small
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleBigSmallSelect("Big")}
                disabled={isLocked}
                style={{
                  flex: 1,
                  backgroundColor: "#F97316",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: isLocked ? 0.5 : 1,
                  borderWidth: selectedBigSmall === "Big" ? 3 : 0,
                  borderColor: "#FFD700",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  Big
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  5-9 • ×2
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleBigSmallSelect("Small")}
                disabled={isLocked}
                style={{
                  flex: 1,
                  backgroundColor: "#3B82F6",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: isLocked ? 0.5 : 1,
                  borderWidth: selectedBigSmall === "Small" ? 3 : 0,
                  borderColor: "#FFD700",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  Small
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  0-4 • ×2
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bet Input Panel */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Bet Amount (Espo Coin)
            </Text>

            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                style={{ color: "#FFD700", fontSize: 18, fontWeight: "700" }}
              >
                🪙
              </Text>
              <TextInput
                value={betAmount}
                onChangeText={setBetAmount}
                placeholder="Enter amount"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  color: "#fff",
                  fontSize: 18,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  fontWeight: "600",
                }}
              />
              {betAmount && (
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  ≈ ₹{toINR(parseInt(betAmount) || 0)}
                </Text>
              )}
            </View>

            {/* Quick bet buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              {[
                { label: "×1", value: 1 },
                { label: "×5", value: 5 },
                { label: "×10", value: 10 },
                { label: "×100", value: 100 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleQuickBet(item.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(99,102,241,0.2)",
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#6366F1",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preset amounts */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {[10, 50, 100, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setBetAmount(amount.toString())}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isLocked}
            style={{
              marginTop: 20,
              backgroundColor: isLocked ? "#4B5563" : "#6366F1",
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: "center",
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isLocked ? 0 : 0.4,
              shadowRadius: 12,
              elevation: isLocked ? 0 : 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {isLocked ? "Betting Locked" : "Confirm Prediction"}
            </Text>
          </TouchableOpacity>

          {/* Bottom Tabs */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 28,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 4,
            }}
          >
            {[
              { id: "history", label: "Game History", icon: History },
              { id: "chart", label: "Chart", icon: BarChart3 },
              { id: "myhistory", label: "My History", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor:
                      activeTab === tab.id ? "#6366F1" : "transparent",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    size={18}
                    color={
                      activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)"
                    }
                  />
                  <Text
                    style={{
                      color:
                        activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: "500",
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content */}
          <View style={{ marginTop: 16 }}>
            {/* Game History Tab */}
            {activeTab === "history" && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      flex: 2,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Period
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Number
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Big/Small
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Color
                  </Text>
                </View>

                {/* Rows */}
                {gameHistory.slice(0, 15).map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(255,255,255,0.05)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        flex: 2,
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 11,
                      }}
                    >
                      {item.periodId.slice(-8)}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {item.number}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: item.bigSmall === "Big" ? "#F97316" : "#3B82F6",
                        fontSize: 12,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {item.bigSmall}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {item.colors.map((color, ci) => (
                        <View
                          key={ci}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: color,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Chart Tab */}
            {activeTab === "chart" && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    marginBottom: 16,
                    fontWeight: "600",
                  }}
                >
                  Number Trend (Last 20)
                </Text>

                {/* Simple bar chart */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    height: 120,
                  }}
                >
                  {gameHistory
                    .slice(0, 20)
                    .reverse()
                    .map((item, index) => {
                      const height = (item.number + 1) * 10;
                      return (
                        <View key={index} style={{ alignItems: "center" }}>
                          <View
                            style={{
                              width: 12,
                              height,
                              backgroundColor: getNumberColor(item.number)[0],
                              borderRadius: 4,
                            }}
                          />
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontSize: 8,
                              marginTop: 4,
                            }}
                          >
                            {item.number}
                          </Text>
                        </View>
                      );
                    })}
                </View>

                {/* Number frequency */}
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      marginBottom: 10,
                    }}
                  >
                    Number Frequency
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                      const count = gameHistory.filter(
                        (h) => h.number === num,
                      ).length;
                      return (
                        <View
                          key={num}
                          style={{
                            backgroundColor: "rgba(255,255,255,0.08)",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: getNumberColor(num)[0],
                              fontSize: 16,
                              fontWeight: "700",
                            }}
                          >
                            {num}
                          </Text>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontSize: 10,
                            }}
                          >
                            {count}×
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* My History Tab */}
            {activeTab === "myhistory" && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      flex: 2,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Period
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Pick
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Bet
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Result
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: "600",
                      textAlign: "right",
                    }}
                  >
                    Payout
                  </Text>
                </View>

                {/* Rows */}
                {userHistory.slice(0, 15).map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(255,255,255,0.05)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        flex: 2,
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 10,
                      }}
                    >
                      {item.periodId.slice(-8)}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {item.selection}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: "#FFD700",
                        fontSize: 12,
                        textAlign: "center",
                      }}
                    >
                      {item.amount}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color:
                          item.result === "Win"
                            ? "#22C55E"
                            : item.result === "Lose"
                              ? "#EF4444"
                              : "#F59E0B",
                        fontSize: 12,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {item.result}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: item.payout >= 0 ? "#22C55E" : "#EF4444",
                        fontSize: 12,
                        fontWeight: "600",
                        textAlign: "right",
                      }}
                    >
                      {item.payout >= 0 ? "+" : ""}
                      {item.payout}
                    </Text>
                  </View>
                ))}

                {userHistory.length === 0 && (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Text
                      style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}
                    >
                      No predictions yet
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* How to Play Modal */}
      <Modal visible={showHowToPlay} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#1A1A2E",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 360,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
                How to Play
              </Text>
              <TouchableOpacity onPress={() => setShowHowToPlay(false)}>
                <X size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{ color: "#6366F1", fontSize: 16, fontWeight: "700" }}
                >
                  1.
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Select a game mode (30s, 1 Min, 3 Min, or 5 Min)
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{ color: "#6366F1", fontSize: 16, fontWeight: "700" }}
                >
                  2.
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Choose your prediction: Color (Green ×2, Violet ×4.5, Red ×2),
                  Number (×9), or Big/Small (×2)
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{ color: "#6366F1", fontSize: 16, fontWeight: "700" }}
                >
                  3.
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Enter your Espo Coin bet amount
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{ color: "#6366F1", fontSize: 16, fontWeight: "700" }}
                >
                  4.
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Confirm before timer ends (betting locks in last 5 seconds)
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text
                  style={{ color: "#6366F1", fontSize: 16, fontWeight: "700" }}
                >
                  5.
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Win Espo Coins if your prediction matches the result!
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 20,
                backgroundColor: "rgba(255,215,0,0.1)",
                padding: 12,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ color: "#FFD700", fontSize: 12, textAlign: "center" }}
              >
                💰 2.5 Espo Coin = ₹1
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowHowToPlay(false)}
              style={{
                marginTop: 20,
                backgroundColor: "#6366F1",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {showToast && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 100,
            left: 20,
            right: 20,
            backgroundColor: "rgba(30,30,50,0.95)",
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(99,102,241,0.3)",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>
            {toastMessage}
          </Text>
        </View>
      )}
    </View>
  );
}
