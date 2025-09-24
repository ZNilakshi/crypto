"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loadSlim } from "@tsparticles/slim";
import { initParticlesEngine } from "@tsparticles/react";
import {
  LineChart as RLineChart,
  Line,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  Building2, 
  Users,
  Sparkles,
  LineChart,
  TrendingUp,
  Copy,
  Share2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { FiTrendingUp, FiCpu, FiDownload, FiUpload } from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

type UserType = {
  name: string;
  referralCode: string;
  email: string;
};

type Point = { time: number; price: number };
type CoinData = {
  symbol: string;
  price: number;
  change: number;
  history: Point[];
};

const pairs = ["btcusdt", "ethusdt", "bnbusdt", "trxusdt"];

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [companyModal, setCompanyModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [market, setMarket] = useState<Record<string, CoinData>>({});
  const router = useRouter();

  const referralLink = user
    ? `${APP_URL}/auth/register?ref=${user.referralCode}`
    : "";

  const deposits = [
    { name: "User1", amount: 500, currency: "USDT" },
    { name: "Shani", amount: 380, currency: "USDT" },
    { name: "Amal", amount: 250, currency: "USDT" },
    { name: "Nila", amount: 700, currency: "USDT" },
  ];

  // Color scheme for icons and UI
  const iconColors = {
    primary: "#10b981", // emerald-500
    secondary: "#06b6d4", // cyan-500
    success: "#22c55e", // green-500
    danger: "#ef4444", // red-500
    warning: "#f59e0b", // amber-500
    info: "#3b82f6", // blue-500
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/auth/verify-email`,
            { idToken: token }
          );
          setUser(res.data.user);
        } catch {
          router.push("/auth/login");
        }
      } else router.push("/auth/login");
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Real-time Binance WebSocket
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${pairs
        .map((p) => `${p}@trade`)
        .join("/")}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const d = msg.data;
      const symbol = d.s.toLowerCase();

      setMarket((prev) => {
        const prevData = prev[symbol] || {
          symbol,
          price: 0,
          change: 0,
          history: [],
        };

        const newPrice = parseFloat(d.p);
        const newHistory = [
          ...prevData.history,
          { time: Date.now(), price: newPrice },
        ].slice(-100);

        return {
          ...prev,
          [symbol]: {
            symbol,
            price: newPrice,
            change:
              ((newPrice - (prevData.history[0]?.price || newPrice)) /
                (prevData.history[0]?.price || newPrice)) *
              100,
            history: newHistory,
          },
        };
      });
    };

    return () => ws.close();
  }, []);

  const handleInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "🚀 Join GreenTech Exchange!",
          text: "Trade crypto securely and earn rewards. Sign up with my referral link 👇",
          url: referralLink,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err.message);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    }
  };

  if (!user) return null;

  return (
    
    <div className="min-h-screen rounded-3xl text-black bg-emerald-900 p-4 relative overflow-hidden">
{/* Hero Section */}
      <div
        className="relative rounded-3xl h-[40vh] w-full bg-cover bg-center overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: "url('/home.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-gray-950/90"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={32} className="mx-auto mb-4" color={iconColors.secondary} />
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Explore the Future of Finance
            </h1>
            <p className="text-white/70 mt-3 text-sm md:text-base max-w-md leading-relaxed">
              Track live crypto markets, invite friends, and earn rewards instantly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setCompanyModal(true)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 
                 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Building2 size={20} color={iconColors.info} />
            <span className="text-sm font-medium">Company Profile</span>
          </button>

          <button
            onClick={handleInvite}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 
                 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 
                 text-white font-semibold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            {copied ? (
              <Copy size={20} color="#ffffff" />
            ) : (
              <Share2 size={20} color="#ffffff" />
            )}
            <span className="text-sm font-medium">
              {copied ? "Copied!" : "Invite & Earn"}
            </span>
          </button>
        </div>
      </div>
    
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Deposit Ticker - Mobile Optimized */}
        <motion.div
          className="overflow-hidden w-full rounded-xl shadow-xl bg-gray-900/80 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex gap-4 py-3 px-4"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {deposits.concat(deposits).map((d, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-white/5 rounded-lg font-medium flex items-center gap-2 shadow-sm flex-shrink-0"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                <DollarSign size={14} color={iconColors.success} />
                <span className="text-xs text-white/80">
                  {d.name} deposited{" "}
                  <span className="font-semibold text-emerald-300">
                    {d.amount} {d.currency}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
  {/* Quick Actions */}
  <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: FiTrendingUp, label: "Stake", color: "from-emerald-500 to-green-500" },
            { icon: FiCpu, label: "AI Trade", color: "from-blue-500 to-cyan-500" },
            { icon: FiDownload, label: "Deposit", color: "from-purple-500 to-indigo-500" },
            { icon: FiUpload, label: "Withdraw", color: "from-orange-500 to-red-500" },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex flex-col items-center space-y-2">
                <action.icon size={24} />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>


      {/* ✅ Real-time Market - Cleaner List Style */}
<motion.div
  className="bg-gray-900/60 rounded-2xl p-4 shadow-lg border border-white/10 backdrop-blur-md"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <LineChart size={20} color={iconColors.primary} />
      <h2 className="text-lg text-white/80 font-bold">Live Market</h2>
    </div>
    <span className="text-xs text-white/50">Updated in real-time</span>
  </div>

  <div className="divide-y divide-white/5">
    {Object.values(market).map((coin) => {
      const prices = coin.history.map((h) => h.price);
      const min = Math.min(...prices, coin.price);
      const chartData = coin.history.map((h, i) => ({
        index: i,
        value: h.price - min,
      }));

      const isPositive = coin.change >= 0;
      const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
// Map coin symbols to their logo URLs
const coinLogos: Record<string, string> = {
  btcusdt: "https://cryptocurrencyliveprices.com/img/btc-bitcoin.png",
  ethusdt: "https://cryptocurrencyliveprices.com/img/eth-ethereum.png",
  bnbusdt: "https://cryptocurrencyliveprices.com/img/bnb-binance-coin.png",
  trxusdt: "https://cryptocurrencyliveprices.com/img/trx-tron.png",
};

      return (
        <div
          key={coin.symbol}
          className="flex items-center justify-between py-3 px-1 hover:bg-white/5 rounded-lg transition"
        >
     {/* Left side: Coin Info */}
<div className="flex items-center gap-3">
  <div
    className={`w-10 h-10 flex items-center justify-center rounded-full ${
      isPositive ? "bg-green-500/20" : "bg-red-500/20"
    }`}
  >
    <img
      src={coinLogos[coin.symbol]}
      alt={coin.symbol}
      className="w-6 h-6 rounded-full object-contain"
    />
  </div>

  <div>
    <p className="font-semibold text-white/80 text-xs uppercase tracking-wide">
      {coin.symbol.replace("usdt", "/USDT")}
    </p>
    <p className="text-xs text-white/50">
      {isPositive ? "Uptrend" : "Downtrend"}
    </p>
  </div>
</div>


          {/* Middle: Price */}
          <div className="text-right">
            <p className="text-base text-xs text-white/80 font-bold">
              ${coin.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span
              className={`text-xs font-medium ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {coin.change.toFixed(2)}%
            </span>
          </div>

          {/* Right: Sparkline */}
          <div className="w-24 h-10 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={chartData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill={`url(#gradient-${coin.symbol})`}
                  fillOpacity={0.3}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? iconColors.success : iconColors.danger}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient
                    id={`gradient-${coin.symbol}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={isPositive ? iconColors.success : iconColors.danger}
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? iconColors.success : iconColors.danger}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    })}
  </div>
</motion.div>

     
      </div>

     
    </div>
  );
}