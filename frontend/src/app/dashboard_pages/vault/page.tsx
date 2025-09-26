"use client";
import { useEffect, useState, useCallback } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase";
import { 
    FiDollarSign, FiCreditCard, FiActivity, FiCpu, FiWifi, FiXCircle,
    FiArrowUp, FiArrowDown, FiLock, FiUnlock, FiCopy, FiCheck,
    FiTrendingUp, FiPauseCircle, FiUsers, FiAward, FiDatabase, FiGlobe, FiAlertCircle, FiCheckCircle, FiHelpCircle, FiClock
} from "react-icons/fi";
import { FiDownload, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";

// Define types for API responses
type ApiResponse =
  | { success: boolean; message?: string } // For POST requests (withdrawals, deposits, stakes, trading, unlock)
  | Summary // For /wallet/summary
  | { deposits: Deposit[]; withdrawals: Withdrawal[] } // For /wallet/transactions
  | { items: Stake[] } // For /stakes GET
  | { items: Trade[] }; // For /trading GET

type Summary = {
  header: { 
    walletBalance: number; 
    stakeTotal: number; 
    commissionsTotal: number; 
    aiTradingTotal: number;  
    totalUSDT: number; 
    stakeProfit?: number;  
    aiTradingProfit?: number;
  };
  bonus: { 
    directDaily: number; 
    l1_3: number; 
    l4_6: number; 
    leaderBonus: number; 
  };
};

type Transaction = {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  txHash?: string;
  toAddress?: string;
  lockedUntil?: string;
  lockDays?: number;
  dailyRate?: number;
  totalEarned?: number;
};

type Deposit = Transaction;
type Withdrawal = Transaction;
type Stake = Transaction & {
  lockedUntil: string;
  lockDays: number;
  dailyRate: number;
};
type Trade = Transaction & {
  totalEarned?: number;
  active: boolean; 
};

type User = {
  walletBalance?: number;
  cryptoAddress?: string;
  walletType?: string;
};

type Popup = {
  type: "success" | "error";
  message: string;
} | null;

export default function MyWalletPage() {
  const [tab, setTab] = useState<"withdraw" | "bonus" | "deposit" | "transactions" | "stake" | "ai-trading">("withdraw");
  const [deps, setDeps] = useState<Deposit[]>([]);
  const [wds, setWds] = useState<Withdrawal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [popup, setPopup] = useState<Popup>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

  const api = useCallback(async (path: string, init?: RequestInit): Promise<ApiResponse> => {
    const currentUser = auth.currentUser;
    const token = currentUser ? await getIdToken(currentUser, true) : "";
    return fetch(process.env.NEXT_PUBLIC_API_BASE + path, {
      ...init,
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    }).then(r => r.json());
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser);
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
  
    fetchUser();
  }, []);
  
  useEffect(() => {
    (async () => {
      const s = await api("/wallet/summary") as Summary;
      setSummary(s);
      const tx = await api("/wallet/transactions") as { deposits: Deposit[]; withdrawals: Withdrawal[] };
      setDeps(tx.deposits || []);
      setWds(tx.withdrawals || []);
    })();
  }, [api]);

  const tabConfig = [
    { id: "withdraw", label: "Withdraw", icon: <FiArrowUp />, color: "from-red-400 to-orange-400" },
    { id: "bonus", label: "Bonus", icon: <FiAward />, color: "from-yellow-400 to-amber-400" },
    { id: "deposit", label: "Deposit", icon: <FiArrowDown />, color: "from-green-400 to-emerald-400" },
    { id: "transactions", label: "Transactions", icon: <FiDatabase />, color: "from-blue-400 to-cyan-400" },
    { id: "stake", label: "Stake", icon: <FiLock />, color: "from-purple-400 to-pink-400" },
    { id: "ai-trading", label: "AI Trading", icon: <FiCpu />, color: "from-indigo-400 to-violet-400" }
  ];
  
  return (
    <div className="min-h-screen rounded-3xl text-black bg-emerald-900 p-4 relative overflow-hidden">
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">

      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <FiCreditCard className="text-teal-500" />
          My Wallet 
        </h1>
        {/* Summary Cards - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 bg-teal-50 backdrop-blur-sm rounded-2xl shadow-lg rounded-3xl lg:grid-cols-5 gap-2 p-3 sm:gap-4">
          <Stat 
            title="Wallet" 
            value={summary?.header.walletBalance} 
            icon={<FiTrendingUp className="text-blue-500" />} 
            mobileFull={false}
            accent
            gradient="from-blue-400 to-cyan-400"
          />
          <Stat 
            title="Commissions" 
            value={summary?.header.commissionsTotal} 
            icon={<FiUsers className="text-green-500" />} 
            mobileFull={false}
            accent
            gradient="from-pink-400 to-red-400"
          />
          <Stat 
            title="Stakes" 
            value={summary?.header.stakeTotal} 
            icon={<FiTrendingUp className="text-purple-500" />} 
            mobileFull={false}
            accent
            gradient="from-green-400 to-emerald-400"
          />
          <Stat 
            title="Stake Profit" 
            value={summary?.header.stakeProfit} 
            icon={<FiDollarSign className="text-green-500" />} 
            mobileFull={false}
            accent
            gradient="from-green-400 to-teal-400"
          /> 
          <Stat 
            title="AI Trading" 
            value={summary?.header.aiTradingTotal} 
            icon={<FiCpu className="text-orange-500" />} 
            mobileFull={false}
            accent
            gradient="from-orange-400 to-amber-400"
          />   
          <Stat 
            title="AI Profit" 
            value={summary?.header.aiTradingProfit || 0} 
            icon={<FiTrendingUp className="text-orange-500" />} 
            accent
            mobileFull={false}
            gradient="from-orange-400 to-red-400"
          /> 
          <Stat 
            title="TOTAL USDT" 
            value={summary?.header.totalUSDT} 
            icon={<FiDollarSign className="text-indigo-500" />} 
            accent 
            mobileFull={true}
            gradient="from-green-700 via-teal-700 to-green-700"
          />
        </div>
        {/* Tab Navigation */}
        <div className="bg-green-50 backdrop-blur-sm rounded-2xl shadow-lg p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {tabConfig.map(({ id, label, icon, color }) => (
              <button
                key={id}
                onClick={() => setTab(id as "withdraw" | "bonus" | "deposit" | "transactions" | "stake" | "ai-trading")}
                className={`
                  flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 
                  px-3 sm:px-4 py-3 rounded-xl text-xs sm:text-xs font-medium relative overflow-hidden
                  transition-all duration-300 transform
                  ${
                    tab === id
                      ? `bg-gradient-to-r ${color} text-white shadow-[0_0_15px_rgba(0,0,0,0.25)] scale-105 ring-2 ring-offset-2 ring-green-400`
                      : "bg-white/70 text-gray-600 border border-gray-300 hover:bg-gray-100 hover:text-indigo-700"
                  }
                `}
              >
                {/* Active indicator dot for mobile */}
                {tab === id && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full sm:hidden animate-ping"></div>
                )}
                {/* Icon */}
                <div
                  className={`
                    text-lg sm:text-base transition-transform duration-300 group-hover:scale-110
                    ${tab === id ? "text-white" : "hidden sm:inline text-gray-700" }
                  `}
                >
                  {icon}
                </div>
                {/* Label */}
                <span
                  className={`${tab === id ? "inline font-semibold" : "text-indigo-500"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 animate-fade-in">
          {tab==="withdraw" && <WithdrawTab api={api} user={user} copyToClipboard={copyToClipboard} copied={copied} setShowLoading={setShowLoading} setPopup={setPopup} />}
          {tab==="bonus" && <BonusTab bonus={summary?.bonus} setPopup={setPopup} />}
          {tab==="deposit" && <DepositTab api={api} copyToClipboard={copyToClipboard} copied={copied} setShowLoading={setShowLoading} setPopup={setPopup} />}
          {tab==="transactions" && <TransactionsTab deps={deps} wds={wds} setPopup={setPopup} />}
          {tab==="stake" && <StakeTab api={api} setShowLoading={setShowLoading} setPopup={setPopup} />}
          {tab==="ai-trading" && <AITradingTab api={api} setShowLoading={setShowLoading} setPopup={setPopup} />}
        </div>
      </div>
      {/* Global 3D Cube Loading Animation */}
      <AnimatePresence>
        {showLoading && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Cube */}
            <motion.div
              className="relative w-24 h-24"
              animate={{ rotateX: 360, rotateY: 360, scale: [1, 1.1, 1] }}
              transition={{ 
                rotateX: { repeat: Infinity, duration: 4, ease: "linear" },
                rotateY: { repeat: Infinity, duration: 3, ease: "linear", delay: 0.2 },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
            >
              {["front","back","left","right","top","bottom"].map((face) => (
                <div key={face}
                  className="absolute w-24 h-24 border-4 bg-white/30 shadow flex justify-center items-center"
                  style={{
                    borderColor: face==="front" ? "#A7F3D0" : face==="back" ? "#D6EFFF" : face==="right" ? "#FFEFD6" : face==="left" ? "#E7D6FF" : face==="top" ? "#D6FFEF" : "#A7F3D0",
                    transform: face==="front" ? "translateZ(48px)" : face==="back" ? "rotateY(180deg) translateZ(48px)" : face==="right" ? "rotateY(90deg) translateZ(48px)" : face==="left" ? "rotateY(-90deg) translateZ(48px)" : face==="top" ? "rotateX(90deg) translateZ(48px)" : "rotateX(-90deg) translateZ(48px)",
                  }}
                />
              ))}
              <div className="absolute inset-0 bg-green-200/20 rounded-lg shadow-inner animate-pulse" />
            </motion.div>
            <div className="w-64 h-3 bg-green-300 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                className="h-3 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
                onUpdate={(latest) => {
                  const width = parseInt((latest as { width: string }).width);
                  setProgressPercent(width);
                }}
              />
              <div className="absolute -top-6 text-white font-bold text-sm" style={{ left: `${progressPercent}%` }}>
                {progressPercent}%
              </div>
            </div>
            <p className="mt-4 text-white font-semibold text-lg">Processing...</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`bg-white p-8 rounded-2xl shadow-2xl text-center w-80 space-y-4
              ${popup.type === "success" ? "border-green-500" : "border-red-500"} border-2`}>
              {popup.type === "success" ? (
                <FiCheckCircle className="text-green-500 text-5xl mx-auto" />
              ) : (
                <FiAlertCircle className="text-red-500 text-5xl mx-auto" />
              )}
              <h2 className="text-xl font-bold">
                {popup.type === "success" ? "Success" : "Error"}
              </h2>
              <p className="text-gray-600">{popup.message}</p>
              <button 
                onClick={() => setPopup(null)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow hover:scale-105 transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
    </div>
  );
}

function Stat({title, value, icon, accent = false, mobileFull = false, gradient}:{
  title: string; 
  value: number | undefined; 
  icon: React.ReactNode; 
  accent?: boolean;
  mobileFull?: boolean;
  gradient?: string;
}) {
  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${accent ? `bg-gradient-to-r ${gradient} text-white animate-float` : 'bg-white/80 backdrop-blur-sm shadow-lg'} flex flex-col ${mobileFull ? 'col-span-2' : ''} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs sm:text-sm ${accent ? 'text-white' : 'text-gray-600'}`}>{title}</div>
        <div className={`p-1 sm:p-2 rounded-full ${accent ? 'bg-white/20' : 'bg-gray-100/50'} transition-transform duration-300 hover:rotate-12`}>
          {icon}
        </div>
      </div>
      <div className={`text-lg sm:text-xl lg:text-2xl font-semibold ${accent ? 'text-white' : 'text-gray-800'}`}>
        {value?.toFixed ? value.toFixed(2) : (value ?? "0.00")} {accent && <span className="text-xs sm:text-sm">USDT</span>}
      </div>
    </div>
  );
}

function WithdrawTab({ api, user, copyToClipboard, copied, setShowLoading, setPopup }: {
  api: (p: string, i?: RequestInit) => Promise<ApiResponse>,
  user: User | null,
  copyToClipboard: (text: string, id: string) => void,
  copied: string | null,
  setShowLoading: (show: boolean) => void,
  setPopup: (popup: Popup) => void
}) {
  const [amount, setAmount] = useState("");
  const [sec, setSec] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [walletType, setWalletType] = useState("");
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    minAmount: 10.0,
    maxAmount: 5000.0,
    processingTime: "1-24 hours",
    network: ""   
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.cryptoAddress) setCryptoAddress(user.cryptoAddress);
      if (user.walletType) {
        setWalletType(user.walletType);
        setWithdrawalDetails(prev => ({ ...prev, network: user.walletType || "" }));
      }
    }
  }, [user]);

  const submit = async () => {
    if (!amount || !sec) {
      setPopup({ type: "error", message: "Please fill all required fields" });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < withdrawalDetails.minAmount) {
      setPopup({ type: "error", message: `Minimum withdrawal amount is ${withdrawalDetails.minAmount} USDT` });
      return;
    }

    if (amountNum > withdrawalDetails.maxAmount) {
      setPopup({ type: "error", message: `Maximum withdrawal amount is ${withdrawalDetails.maxAmount} USDT` });
      return;
    }

    setLoading(true);
    setShowLoading(true);

    try {
      const res = await api("/withdrawals", {
        method: "POST",
        body: JSON.stringify({
          amount: amountNum,
          securityPassword: sec,
          walletType: walletType,
          toAddress: cryptoAddress,
          network: withdrawalDetails.network
        })
      }) as { success: boolean; message?: string };

      setLoading(false);
      setShowLoading(false);

      if (res.success) {
        setPopup({
          type: "success",
          message: `Withdrawal request submitted! You will receive ${amountNum} USDT (5% fee applied). Processing time: ${withdrawalDetails.processingTime}`,
        });
        setAmount("");
        setSec("");
      } else {
        setPopup({ type: "error", message: res.message || "Withdrawal failed. Please try again." });
      }
    } catch {
      setLoading(false);
      setShowLoading(false);
      setPopup({ type: "error", message: "Network error. Please check your connection and try again." });
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="space-y-6 text-black">
      {/* Header with glow */}
      <div className="relative bg-gradient-to-r from-green-100 to-green-50 p-4 sm:p-5 rounded-2xl border border-green-300 
                shadow-[0_0_25px_rgba(34,197,94,0.45)] hover:shadow-[0_0_45px_rgba(34,197,94,0.7)] 
                transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          {/* Left side */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-green-300 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse">
                <FiArrowUp className="text-green-800 text-lg sm:text-xl" />
              </div>
              Withdraw Funds
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Transfer your earnings to your wallet
            </p>
          </div>
          {/* Right side */}
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm text-gray-500">Available Balance</div>
            <div className="text-lg sm:text-2xl font-bold text-green-600 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
              {user?.walletBalance?.toFixed(2)} USDT
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <div className="space-y-5">
          <div className="bg-lime-50 p-5 rounded-2xl border border-gray-300 
                          shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] 
                          transition-all duration-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-green-500" />
              Withdrawal Details
            </h3>
            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Amount (USDT)</span>
                  <span className="text-xs text-gray-500">Min: 10 USDT</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full p-4 border border-gray-300 rounded-xl 
                               focus:ring-4 focus:ring-green-400 focus:border-green-500 
                               hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] 
                               transition-all duration-500 pr-16 bg-white/90" 
                    value={amount} 
                    onChange={e=>setAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FiDollarSign className="text-gray-400 text-lg" />
                  </div>
                </div>
                {/* Quick amount buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map(quickAmount => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg 
                                 hover:bg-green-200 transition-all duration-500 transform hover:scale-110 
                                 shadow-[0_0_10px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7)]"
                    >
                      {quickAmount} USDT
                    </button>
                  ))}
                </div>
              </div>
              {/* Security password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Security Password </span>
                  <span className="text-xs text-gray-500">If not set, set it in Profile  </span>
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    className="w-full p-4 border border-gray-300 rounded-xl 
                               focus:ring-4 focus:ring-green-400 focus:border-green-500 
                               hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] 
                               transition-all duration-500 pr-12 bg-white/90" 
                    value={sec} 
                    onChange={e=>setSec(e.target.value)}
                    required
                    placeholder="Enter your security password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FiLock className="text-gray-400 text-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Submit button */}
          <button 
            onClick={submit} 
            disabled={loading || !amount || !sec}
            className="w-full flex justify-center items-center gap-3 py-4 px-6 
                       bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl 
                       hover:from-red-600 hover:to-orange-600 
                       focus:outline-none focus:ring-4 focus:ring-red-400/70  disabled:cursor-not-allowed 
                       transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] 
                       hover:shadow-[0_0_45px_rgba(239,68,68,0.8)] 
                       transform hover:scale-[1.05]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                Processing Withdrawal...
              </>
            ) : (
              <>
                <FiArrowUp className="text-lg" />
                <span className="font-semibold">Withdraw Now</span>
              </>
            )}
          </button>
        </div>
        {/* Wallet Address Section */}
        <div className="bg-green-50 p-5 rounded-2xl border border-green-200 
                        shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] 
                        transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-300 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse">
              <FiWifi className="text-green-800 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-green-800">Your Wallet Address</h3>
          </div>
          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Type</label>
            <input
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
              value={walletType || "Not Set"}
              disabled
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crypto Address</label>
              <div className="relative">
                <input 
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl 
                             focus:ring-4 focus:ring-green-400 focus:border-green-500 
                             hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] 
                             transition-all duration-500 pr-12" 
                  value={cryptoAddress} 
                  onChange={e=>setCryptoAddress(e.target.value)} 
                  disabled={!!user?.cryptoAddress}
                  placeholder="Enter your USDT wallet address"
                />
                {cryptoAddress && (
                  <button 
                    onClick={() => copyToClipboard(cryptoAddress, 'withdraw-address')}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 
                               hover:text-green-600 transition-colors"
                    title="Copy address"
                  >
                    {copied === 'withdraw-address' ? 
                      <FiCheck className="text-green-500 text-lg" /> : 
                      <FiCopy className="text-lg" />
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BonusTab({ bonus }: {
  bonus?: Summary["bonus"],
  setPopup: (popup: Popup) => void
}) {
  const bonusData = [
    { title: "Total Balance", value: (bonus?.directDaily||0)+(bonus?.l1_3||0)+(bonus?.l4_6||0)+(bonus?.leaderBonus||0), icon: <FiCreditCard className="text-blue-500" />, color: "from-blue-400 to-cyan-400" },
    { title: "Direct Commissions", value: bonus?.directDaily||0, icon: <FiUsers className="text-green-500" />, color: "from-green-400 to-emerald-400" },
    { title: "Layer 1-3 Commissions", value: bonus?.l1_3||0, icon: <FiTrendingUp className="text-purple-500" />, color: "from-purple-400 to-pink-400" },
    { title: "Layer 4-6 Commissions", value: bonus?.l4_6||0, icon: <FiGlobe className="text-yellow-500" />, color: "from-yellow-400 to-amber-400" },
    { title: "Leader Bonus", value: bonus?.leaderBonus||0, icon: <FiAward className="text-red-500" />, color: "from-red-400 to-orange-400" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <FiAward className="text-yellow-500 animate-pulse" /> Bonus Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bonusData.map((item, index) => (
          <div key={index} className={`bg-gradient-to-r ${item.color} rounded-2xl p-5 text-white shadow-md transition-transform duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                {item.icon}
              </div>
              <span className="text-2xl font-bold">{item.value.toFixed(2)} USDT</span>
            </div>
            <h3 className="text-sm font-medium text-white/90">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepositTab({ api, copyToClipboard, copied, setShowLoading, setPopup }: { 
  api: (p: string, i?: RequestInit) => Promise<ApiResponse>, 
  copyToClipboard: (text: string, id: string) => void, 
  copied: string | null,
  setShowLoading: (show: boolean) => void,
  setPopup: (popup: Popup) => void
}) {
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [network, setNetwork] = useState<"TRC20" | "BEP20">("TRC20");
  const [loading, setLoading] = useState(false);

  const walletAddresses = {
    TRC20: "TAbnTnhXFXe3okDSLwwSosZq6sZ6hSAAAA",
    BEP20: "0xBrnTnhXFXe3okDSLwwSosZq6sZ6hSBBBB"
  };

  const submit = async () => {
    if (!amount || !txHash) {
      setPopup({ type: "error", message: "Please fill all fields" });
      return;
    }

    if (+amount < 10) {
      setPopup({ type: "error", message: "Minimum deposit is 10 USDT" });
      return;
    }

    setLoading(true);
    setShowLoading(true);
    try {
      const res = await api("/deposits", {
        method: "POST",
        body: JSON.stringify({ 
          amount: +amount, 
          txHash: txHash.trim(), 
          network 
        }),
      }) as { success: boolean; message?: string };

      setLoading(false);
      setShowLoading(false);

      if (res.success) {
        setAmount("");
        setTxHash("");
        setPopup({ type: "success", message: res.message || "Deposit submitted for verification" });
      } else {
        setPopup({ type: "error", message: res.message || "Deposit failed" });
      }
    } catch {
      setLoading(false);
      setShowLoading(false);
      setPopup({ type: "error", message: "An error occurred while processing your deposit" });
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full animate-pulse">
              <FiArrowDown className="text-blue-600 text-xl" />
            </div>
            Deposit Funds
          </h2>
          <p className="text-gray-600 mt-1">Add funds to your account using USDT</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Network Selection */}
          <div className="bg-lime-50 p-5 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiGlobe className="text-indigo-500 animate-pulse" />
              Select Network
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {["TRC20", "BEP20"].map((n) => (
                <button
                  key={n}
                  onClick={() => setNetwork(n as "TRC20" | "BEP20")}
                  className={`p-4 border rounded-xl text-center transition-all transform hover:scale-105 ${
                    network === n
                      ? n === "TRC20"
                        ? "border-green-500 bg-green-50 text-green-700 font-medium shadow-md"
                        : "border-yellow-500 bg-yellow-50 text-yellow-700 font-medium shadow-md"
                      : "border-gray-300 text-gray-600 hover:border-indigo-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full mb-2 animate-pulse ${n === "TRC20" ? "bg-green-100" : "bg-yellow-100"}`}>
                      {n === "TRC20" ? <FiGlobe className="text-green-600" /> : <FiDatabase className="text-yellow-600" />}
                    </div>
                    <span>{n}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Addresses */}
          <div className="bg-teal-50 p-5 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiWifi className="text-indigo-500 animate-pulse" />
              Deposit Addresses
            </h3>
            {Object.entries(walletAddresses).map(([net, addr]) => (
              <div key={net} className={`p-4 border rounded-xl transition-all transform hover:scale-[1.02] ${
                network === net ? (net === "TRC20" ? "border-green-500 bg-green-50 shadow-md" : "border-yellow-500 bg-yellow-50 shadow-md") : "border-gray-200 hover:border-gray-400"
              } mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full animate-pulse ${net === "TRC20" ? "bg-green-100" : "bg-yellow-100"}`}>
                      {net === "TRC20" ? <FiGlobe className="text-green-600 text-sm" /> : <FiDatabase className="text-yellow-600 text-sm" />}
                    </div>
                    <span className="font-medium text-gray-700">{net} Address</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(addr, `${net}-address`)}
                    className={`text-sm ${net === "TRC20" ? "text-indigo-600 bg-indigo-100" : "text-yellow-600 bg-yellow-100"} hover:opacity-80 flex items-center gap-1 px-2 py-1 rounded-lg transition-all`}
                  >
                    {copied === `${net}-address` ? <><FiCheck className="text-green-500 text-sm animate-bounce"/> Copied</> : <><FiCopy className="text-sm" /> Copy</>}
                  </button>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-300 text-xs font-mono break-all">{addr}</div>
                <p className="text-xs text-gray-500 mt-1">Send only USDT ({net}) to this address</p>
              </div>
            ))}
          </div>
          {/* Deposit Form */}
          <div className="bg-lime-50 p-5 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-indigo-500 animate-pulse" />
              Deposit Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FiDollarSign className="text-gray-400 text-lg" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum deposit: 10 USDT</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash</label>
                <div className="relative">
                  <input 
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                    value={txHash} 
                    onChange={e => setTxHash(e.target.value)}
                    placeholder="Enter your transaction hash"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FiCreditCard className="text-gray-400 text-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <button 
            onClick={submit} 
            disabled={loading || !amount || !txHash}
            className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md transform hover:scale-[1.02] animate-pulse"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                Processing Deposit...
              </>
            ) : (
              <>
                <FiArrowDown className="text-lg" />
                <span className="font-semibold">Submit Deposit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab({ deps, wds, setPopup }: { 
  deps: Deposit[]; 
  wds: Withdrawal[]; 
  setPopup: (popup: Popup) => void;
}) {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

  const StatusPill = ({ status }: { status: string }) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactElement; label: string }
    > = {
      approved: {
        color: "bg-green-100 text-green-800",
        icon: <FiCheckCircle className="text-green-500" />,
        label: "Approved",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <FiClock className="text-yellow-500 animate-pulse" />,
        label: "Pending",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: <FiXCircle className="text-red-500" />,
        label: "Rejected",
      },
      hold: {
        color: "bg-purple-100 text-purple-800",
        icon: <FiPauseCircle className="text-purple-500" />,
        label: "On Hold",
      },
    };
  
    const config =
      statusConfig[status.toLowerCase()] || {
        color: "bg-gray-100 text-gray-800",
        icon: <FiHelpCircle className="text-gray-500" />,
        label: status,
      };
  
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };
  
  const TransactionCard = ({
    transaction,
    type,
  }: {
    transaction: Transaction;
    type: "deposit" | "withdrawal";
  }) => {
    const isDeposit = type === "deposit";
    const Icon = isDeposit ? FiArrowDown : FiArrowUp;
    const iconColor = isDeposit ? "text-green-500" : "text-red-500";
    const bgColor = isDeposit ? "bg-green-50" : "bg-red-50";

    const handleCopy = (text: string, copyType: string) => {
      navigator.clipboard.writeText(text);
      setPopup({ type: "success", message: `${copyType} copied to clipboard!` });
    };

    return (
      <div className="bg-teal-50 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all transform hover:scale-[1.01] animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Left section */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${bgColor} animate-pulse`}>
              <Icon className={`text-lg ${iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {transaction.amount} USDT
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isDeposit ? "Deposit" : "Withdrawal"} •{" "}
                {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <StatusPill status={transaction.status} />
              </div>
            </div>
          </div>
          {/* Right section */}
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500">
              {new Date(transaction.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {/* Bottom info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 break-all">
            {isDeposit ? (
              <>
                <FiCreditCard className="text-gray-400" />
                <span className="font-mono truncate">{transaction.txHash}</span>
                <button
                  onClick={() => handleCopy(transaction.txHash || "", "Transaction hash")}
                  className="text-gray-400 hover:text-gray-600 ml-2 transition-transform transform hover:scale-110"
                >
                  <FiCopy size={14} />
                </button>
              </>
            ) : (
              <>
                <FiCopy className="text-gray-400" />
                <span className="font-mono truncate">{transaction.toAddress}</span>
                <button
                  onClick={() => handleCopy(transaction.toAddress || "", "Wallet address")}
                  className="text-gray-400 hover:text-gray-600 ml-2 transition-transform transform hover:scale-110"
                >
                  <FiCopy size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full animate-pulse">
                <FiDatabase className="text-blue-600 text-xl" />
              </div>
              Transaction History
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              View your deposit and withdrawal history
            </p>
          </div>
          <div className="sm:text-right">
            <div className="text-sm text-gray-500">Total Transactions</div>
            <div className="text-lg sm:text-xl font-bold text-blue-700 animate-pulse">
              {deps.length + wds.length}
            </div>
          </div>
        </div>
      </div>
      {/* Tab Navigation (scrollable on mobile) */}
      <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 animate-fade-in">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all transform hover:scale-105 ${
              activeTab === "deposits"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-md"
                : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 border border-gray-200"
            }`}
          >
            <FiArrowDown
              className={
                activeTab === "deposits"
                  ? "text-indigo-600 animate-pulse"
                  : "text-gray-500"
              }
            />
            <span>Deposits</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                activeTab === "deposits"
                  ? "bg-indigo-100 text-indigo-700 animate-pulse"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {deps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all transform hover:scale-105 ${
              activeTab === "withdrawals"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-md"
                : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 border border-gray-200"
            }`}
          >
            <FiArrowUp
              className={
                activeTab === "withdrawals"
                  ? "text-indigo-600 animate-pulse"
                  : "text-gray-500"
              }
            />
            <span>Withdrawals</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                activeTab === "withdrawals"
                  ? "bg-indigo-100 text-indigo-700 animate-pulse"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {wds.length}
            </span>
          </button>
        </div>
      </div>
      {/* Transaction Cards */}
      <div className="space-y-4">
        {activeTab === "deposits" ? (
          deps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deps.map((d, i) => (
                <TransactionCard key={i} transaction={d} type="deposit" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <FiDatabase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                No deposits yet
              </h3>
              <p className="mt-1 text-gray-500 text-sm sm:text-base">
                You haven&apos;t made any deposits yet.
              </p>
              <button 
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
              >
                <FiArrowDown className="text-sm" />
                Make your first deposit
              </button>
            </div>
          )
        ) : wds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wds.map((w, i) => (
              <TransactionCard key={i} transaction={w} type="withdrawal" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <FiDatabase className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              No withdrawals yet
            </h3>
            <p className="mt-1 text-gray-500 text-sm sm:text-base">
              You haven&apos;t made any withdrawals yet.
            </p>
            <button 
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              <FiArrowUp className="text-sm" />
              Make your first withdrawal
            </button>
          </div>
        )}
      </div>
      {/* Summary Stats */}
      {(deps.length > 0 || wds.length > 0) && (
        <div className="bg-lime-50 p-5 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
          <h3 className="font-semibold text-gray-800 mb-4">
            Transaction Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full animate-pulse">
                  <FiDatabase className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Transactions</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900 animate-pulse">
                    {deps.length + wds.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full animate-pulse">
                  <FiArrowDown className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Total Deposits</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900 animate-pulse">
                    {deps.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full animate-pulse">
                  <FiArrowUp className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Total Withdrawals</p>
                  <p className="text-lg sm:text-xl font-bold text-red-900 animate-pulse">
                    {wds.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StakeTab({ api, setShowLoading, setPopup }: { 
  api: (path: string, init?: RequestInit) => Promise<ApiResponse>,
  setShowLoading: (show: boolean) => void,
  setPopup: (popup: Popup) => void
}) {
  const [amount, setAmount] = useState("");
  const [plan, setPlan] = useState("7");
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(false);

  const stakePlans = [
    { id: "7", days: 7, rate: 0.013, label: "7 Days", color: "from-blue-500 to-blue-600", icon: <FiCalendar className="text-blue-100" /> },
    { id: "15", days: 15, rate: 0.014, label: "15 Days", color: "from-purple-500 to-purple-600", icon: <FiCalendar className="text-purple-100" /> },
    { id: "30", days: 30, rate: 0.015, label: "30 Days", color: "from-indigo-500 to-indigo-600", icon: <FiCalendar className="text-indigo-100" /> }
  ];
  
  const fetchStakes = useCallback(async () => {
    try {
      const res = await api("/stakes") as { items: Stake[] };
      setStakes(res.items || []);
    } catch {
      setPopup({ type: "error", message: "Failed to fetch stakes" });
    }
  }, [api, setPopup]);

  useEffect(() => { 
    fetchStakes(); 
  }, [fetchStakes]);

  const submit = async () => {
    if (!amount || +amount < 50) {
      setPopup({ type: "error", message: "Minimum stake amount is 50 USDT" });
      return;
    }
    
    setLoading(true);
    setShowLoading(true);
    try {
      const res = await api("/stakes", { 
        method: "POST", 
        body: JSON.stringify({ amount: +amount, lockDays: +plan })
      }) as { success: boolean; message?: string };
      
      setLoading(false);
      setShowLoading(false);
      
      if (res.success) {
        setPopup({ type: "success", message: res.message || "Staked successfully!" });
        setAmount("");
        fetchStakes();
      } else {
        setPopup({ type: "error", message: res.message || "Failed to stake" });
      }
    } catch {
      setLoading(false);
      setShowLoading(false);
      setPopup({ type: "error", message: "An error occurred while processing your stake" });
    }
  };

  const handleUnstake = async (stakeId: string, amt: number) => {
    setShowLoading(true);
    try {
      const res = await api("/stakes/unstake", { 
        method: "POST", 
        body: JSON.stringify({ stakeId, amount: amt }) 
      }) as { success: boolean; message?: string };
      
      setShowLoading(false);
      
      if (res.success) {
        setPopup({ type: "success", message: res.message || "Unstaked successfully!" });
        fetchStakes();
      } else {
        setPopup({ type: "error", message: res.message || "Failed to unstake" });
      }
    } catch {
      setShowLoading(false);
      setPopup({ type: "error", message: "Error unstaking" });
    }
  };

  const selectedPlan = stakePlans.find(p => p.id === plan);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <FiLock className="text-purple-600 text-xl" />
              </div>
              Stake Funds
            </h2>
            <p className="text-gray-600 mt-1">Lock your funds to earn daily rewards</p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-sm text-gray-500">Total Staked</div>
            <div className="text-xl font-bold text-purple-700">
              {stakes.reduce((total, stake) => total + stake.amount, 0).toFixed(2)} USDT
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Stake Form */}
        <div className="space-y-5">
          {/* Plan Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCalendar className="text-blue-500" />
              Choose Plan
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {stakePlans.map(planOption => (
                <div 
                  key={planOption.id}
                  onClick={() => setPlan(planOption.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    plan === planOption.id 
                      ? 'border-purple-500 bg-purple-50 shadow-sm' 
                      : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${planOption.color}`}>
                        {planOption.icon}
                      </div>
                      <div>
                        <div className={`font-semibold ${plan === planOption.id ? 'text-purple-700' : 'text-gray-700'}`}>
                          {planOption.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(planOption.rate * 100).toFixed(2)}% daily reward
                        </div>
                      </div>
                    </div>
                    {plan === planOption.id && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <FiCheck className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Amount Input */}
          <div className="bg-white p-5 rounded-2xl text-black shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-green-500" />
              Stake Amount
            </h3>
            <div className="relative">
              <input 
                type="number" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-medium" 
                value={amount} 
                onChange={e=>setAmount(e.target.value)}
                min="50"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-gray-500 font-medium">USDT</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Minimum stake: 50 USDT</p>
            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[50, 100, 200, 500, 1000].map(quickAmount => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  {quickAmount} USDT
                </button>
              ))}
            </div>
          </div>
          {/* Projected Earnings */}
          {selectedPlan && amount && +amount >= 50 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                Projected Earnings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Daily earnings:</span>
                  <span className="font-semibold text-blue-900">
                    {(+amount * selectedPlan.rate).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Total after {selectedPlan.days} days:</span>
                  <span className="font-semibold text-blue-900">
                    {(+amount * (1 + selectedPlan.rate * selectedPlan.days)).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                  <span className="text-blue-800 font-medium">Total profit:</span>
                  <span className="font-bold text-blue-900">
                    +{(+amount * selectedPlan.rate * selectedPlan.days).toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* Stake Button */}
          <button 
            onClick={submit} 
            disabled={loading || !amount || +amount < 50}
            className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                Processing Stake...
              </>
            ) : (
              <>
                <FiLock className="text-lg" />
                <span className="font-semibold text-lg">Stake Now</span>
              </>
            )}
          </button>
        </div>
        {/* Right Column - Active Stakes */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiActivity className="text-green-500" />
              Active Stakes
              <span className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {stakes.length}
              </span>
            </h3>
            {stakes.length > 0 ? (
              <div className="space-y-4">
                {stakes.map(s => {
                  const unlocked = new Date() >= new Date(s.lockedUntil);
                  const daysLeft = Math.ceil((new Date(s.lockedUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={s._id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${unlocked ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {unlocked ? (
                              <FiUnlock className="text-green-600" />
                            ) : (
                              <FiLock className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-800">{s.amount.toFixed(2)} USDT</div>
                            <div className="text-sm text-gray-600">
                              {s.lockDays} days @ {(s.dailyRate * 100).toFixed(2)}% daily
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          unlocked ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {unlocked ? (
                            <FiCheckCircle className="text-green-500" />
                          ) : (
                            <FiClock className="text-blue-500" />
                          )}
                          {unlocked ? 'Unlocked' : `${daysLeft} days left`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>Unlocks: {new Date(s.lockedUntil).toLocaleDateString()}</span>
                        <span>Earned: {(s.amount * s.dailyRate * s.lockDays).toFixed(2)} USDT</span>
                      </div>
                      <button 
                        onClick={() => handleUnstake(s._id, s.amount)} 
                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                          unlocked 
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!unlocked}
                      >
                        {unlocked ? (
                          <span className="flex items-center justify-center gap-2">
                            <FiDownload className="text-lg" />
                            Unstake Now
                          </span>
                        ) : (
                          'Locked'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiLock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No active stakes</h3>
                <p className="mt-1 text-gray-500">Start staking to earn daily rewards</p>
              </div>
            )}
          </div>

          {/* Statistics Card */}
          {stakes.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-4">Staking Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <div className="text-sm text-purple-600">Total Staked</div>
                  <div className="font-bold text-purple-800 text-lg">
                    {stakes.reduce((total, stake) => total + stake.amount, 0).toFixed(2)} USDT
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100">
                  <div className="text-sm text-purple-600">Total Rewards</div>
                  <div className="font-bold text-purple-800 text-lg">
                    {stakes.reduce((total, stake) => total + (stake.amount * stake.dailyRate * stake.lockDays), 0).toFixed(2)} USDT
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AITradingTab({ api, setShowLoading, setPopup }: { 
  api: (path: string, init?: RequestInit) => Promise<ApiResponse>,
  setShowLoading: (show: boolean) => void,
  setPopup: (popup: Popup) => void
}) {
  const [amount, setAmount] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await api("/trading") as { items: Trade[] };
      setTrades(res.items || []);
    } catch {
      setPopup({ type: "error", message: "Failed to fetch trades" });
    }
  }, [api, setPopup]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const deposit = async () => {
    if (!amount) {
      setPopup({ type: "error", message: "Please enter an amount" });
      return;
    }
    
    if (+amount < 10) {
      setPopup({ type: "error", message: "Minimum investment is 10 USDT" });
      return;
    }

    setLoading(true);
    setShowLoading(true);
    try {
      const res = await api("/trading", {
        method: "POST",
        body: JSON.stringify({ amount: +amount }),
      }) as { success: boolean; message?: string };
      
      setLoading(false);
      setShowLoading(false);
      
      if (res.success) {
        setPopup({ type: "success", message: res.message || "Successfully added to AI Trading!" });
        setAmount("");
        fetchTrades();
      } else {
        setPopup({ type: "error", message: res.message || "Failed to invest" });
      }
    } catch {
      setLoading(false);
      setShowLoading(false);
      setPopup({ type: "error", message: "An error occurred while processing your investment" });
    }
  };

  const unlockInvestment = async (tradeId: string) => {
    if (!tradeId) {
      setPopup({ type: "error", message: "Invalid trade ID" });
      return;
    }

    setShowLoading(true);
    try {
      const res = await api(`/trading/unlock/${tradeId}`, {
        method: "POST",
      }) as { success: boolean; message?: string };

      setShowLoading(false);
      
      if (res.success) {
        setPopup({ type: "success", message: res.message || "Funds unlocked successfully!" });
        fetchTrades();
      } else {
        setPopup({ type: "error", message: res.message || "Failed to unlock trade" });
      }
    } catch {
      setShowLoading(false);
      setPopup({ type: "error", message: "Error unlocking investment" });
    }
  };

  const totalInvested = trades.reduce((total, trade) => total + trade.amount, 0);
  const totalEarned = trades.reduce((total, trade) => total + (trade.totalEarned || 0), 0);

  return (
    <div className="space-y-6 text-gray-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <FiCpu className="text-orange-600 text-xl" />
              </div>
              AI Trading
            </h2>
            <p className="text-gray-600 mt-1">Let our AI trade for you 24/7 (1.2% daily)</p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-sm text-gray-500">Total Invested</div>
            <div className="text-xl font-bold text-orange-700">{totalInvested.toFixed(2)} USDT</div>
          </div>
        </div>
      </div>

      {/* Investment Form + Active Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Form */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-green-500" />
              Invest in AI Trading
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <input
                type="number"
                className="w-full p-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="10"
              />
              <p className="text-xs text-gray-500 mt-2">Minimum: 10 USDT</p>
            </div>
          </div>
          
        

          <button
            onClick={deposit}
            disabled={loading || !amount || +amount < 10}
            className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                Processing Investment...
              </>
            ) : (
              <>
                <FiTrendingUp className="text-lg" />
                <span className="font-semibold text-lg">Start AI Trading</span>
              </>
            )}
          </button>
        </div>
  {/* Investment Stats */}
  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100">
            <h3 className="font-semibold text-orange-800 mb-4">Investment Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-orange-100">
                <div className="text-sm text-orange-600">Total Invested</div>
                <div className="font-bold text-orange-800 text-lg">
                  {totalInvested.toFixed(2)} USDT
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-orange-100">
                <div className="text-sm text-orange-600">Total Earned</div>
                <div className="font-bold text-orange-800 text-lg">
                  {totalEarned.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </div>
        {/* Active Trades */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiActivity className="text-purple-500" />
              Active AI Investments
              <span className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {trades.length}
              </span>
            </h3>

            {trades.length > 0 ? (
              trades.map((t) => {
                const hoursActive = (new Date().getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                const isCompleted = hoursActive >= 24;
                const progress = Math.min((hoursActive / 24) * 100, 100);

                return (
                  <div key={t._id} className="p-5 border rounded-2xl mb-4 bg-white shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <FiTrendingUp className="text-orange-600 text-lg" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{t.amount.toFixed(2)} USDT</div>
                          <div className="text-xs text-gray-500">
                            Started: {new Date(t.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {isCompleted ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiClock className="text-yellow-500" />
                        )}
                        {isCompleted ? 'Completed' : 'Processing'}
                      </span>
                    </div>

                    {!isCompleted && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                 

{isCompleted && t.active !== false && (
  <button
    onClick={() => unlockInvestment(t._id)}
    className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md transform hover:scale-[1.02]"
  >
    <span className="flex items-center justify-center gap-2">
      <FiDownload className="text-lg" />
      Unlock & Add to Wallet
    </span>
  </button>
)}

{/* ✅ Show credited message instead of button if unlocked */}
{isCompleted && t.active === false && (
  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
    <span className="text-green-700 font-semibold">
      Credited 
    </span>
  </div>
)}

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiCpu className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No active investments</h3>
                <p className="mt-1 text-gray-500">Start investing to let AI trade for you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

<style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
`}</style>


