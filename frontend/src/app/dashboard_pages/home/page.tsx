"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loadSlim } from "@tsparticles/slim";
import { initParticlesEngine } from "@tsparticles/react";
import { LineChart as RLineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingDown, Building2, Users, Sparkles, LineChart, TrendingUp } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

type CryptoType = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
};
type UserType = {
  name: string;
  referralCode: string;
  email: string;
};
export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [companyModal, setCompanyModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cryptos, setCryptos] = useState<CryptoType[]>([]);
  const router = useRouter();

  const referralLink = user ? `${APP_URL}/auth/register?ref=${user.referralCode}` : "";

  const deposits = [
    { name: "User1", amount: 500, currency: "USDT" },
    { name: "Shani", amount: 380, currency: "USDT" },
    { name: "Amal", amount: 250, currency: "USDT" },
    { name: "Nila", amount: 700, currency: "USDT" },
  ];

  // Fixed colors with explicit values
  const getCryptoColor = (cryptoId: string, priceChange: number) => {
    // Use specific colors for known cryptocurrencies
    const cryptoColors: Record<string, string> = {
      bitcoin: "#f7931a",
      ethereum: "#627eea",
      binancecoin: "#f3ba2f",
      tron: "#d70000",
    };
    
    // Return crypto-specific color or green/red based on price change
    return cryptoColors[cryptoId] || (priceChange >= 0 ? "#16a34a" : "#dc2626");
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { idToken: token });
          setUser(res.data.user);
        } catch {
          router.push("/auth/login");
        }
      } else router.push("/auth/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: { vs_currency: "usd", ids: "bitcoin,ethereum,binancecoin,tron", sparkline: true },
        });
        setCryptos(res.data);
      } catch (error) {
        console.error("Error fetching market data", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
    <div className="min-h-screen rounded-3xl bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white">
      {/* Custom styles for chart colors */}
      <style jsx global>{`
        .positive-chart { stroke: #16a34a !important; }
        .negative-chart { stroke: #dc2626 !important; }
        .bitcoin-chart { stroke: #f7931a !important; }
        .ethereum-chart { stroke: #627eea !important; }
        .binancecoin-chart { stroke: #f3ba2f !important; }
        .tron-chart { stroke: #d70000 !important; }
        
        .recharts-line-curve {
          stroke: inherit !important;
        }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: #374151 !important;
        }
      `}</style>

      {/* Hero Section */}
      <div
        className="relative rounded-3xl h-[40vh] md:h-[60vh] w-full bg-cover bg-center overflow-hidden rounded-b-3xl"
        style={{
          backgroundImage: "url('/home.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-gray-950/90"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Explore the Future of Finance 🌍
          </h1>
          <p className="text-white/70 mt-4 text-base md:text-lg max-w-xl leading-relaxed">
            Track live crypto markets, invite friends, and earn rewards instantly.
          </p>
        </div>
      </div>

      {/* Action Section (Company + Invite) */}
      <div className="max-w-6xl mx-auto px-4 mt-4 md:mt-12">
        <div className="flex justify-between items-center gap-4">
          {/* Company Button (Left) */}
          <button
            onClick={() => setCompanyModal(true)}
            className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                       hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Building2 size={22} /> Company Profile
          </button>

          {/* Invite & Earn Button (Right) */}
          <button
            onClick={handleInvite}
            className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 
                       hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 
                       text-white font-semibold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <Users size={22} /> {copied ? "Copied!" : "Invite & Earn"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Deposit Ticker */}
        <motion.div
          className="overflow-hidden w-full rounded-2xl shadow-xl bg-gray-900/80 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="flex gap-6 py-4 px-6"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          >
            {deposits.concat(deposits).map((d, i) => (
              <div
                key={i}
                className="px-5 py-2 bg-white/5 rounded-lg font-medium flex items-center gap-3 shadow-sm hover:scale-105 transition"
              >
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                💸 {d.name} deposited{" "}
                <span className="font-semibold text-emerald-300">
                  {d.amount} {d.currency}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Market Data */}
        <motion.div
          className="bg-gray-800/80 rounded-xl p-6 shadow-xl border border-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <LineChart size={24} /> Real-time Market
          </h2>
          <div className="flex flex-col divide-y divide-white/10">
            {cryptos.map((crypto, index) => {
              const isPositive = Number(crypto.price_change_percentage_24h) >= 0;
              const cryptoColor = getCryptoColor(crypto.id, crypto.price_change_percentage_24h);
              
              return (
                <div
                  key={crypto.id}
                  className="flex items-center justify-between py-4 hover:bg-white/5 rounded-lg px-2 transition"
                >
                  {/* Logo and Name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 rounded-full border border-white/10"
                    />
                    <div>
                      <p className="font-semibold">{crypto.name}</p>
                      <p className="text-white/60 text-sm uppercase">
                        {crypto.symbol}
                      </p>
                    </div>
                  </div>

                  {/* Sparkline Chart */}
                  <div className="w-36 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart
                        data={crypto.sparkline_in_7d.price.map((p, i, arr) => ({
                          value: p - Math.min(...arr),
                          index: i,
                        }))}
                      >
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={cryptoColor}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={true}
                          className={`${crypto.id}-chart`}
                          style={{ 
                            stroke: cryptoColor,
                            strokeWidth: 2 
                          }}
                        />
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Price and Change */}
                  <div className="text-right flex flex-col items-end">
                    <p className="font-semibold">
                      ${crypto.current_price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp size={16} className="text-green-400" />
                      ) : (
                        <TrendingDown size={16} className="text-red-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? "text-green-400" : "text-red-400"
                        }`}
                        style={{
                          color: isPositive ? "#34d399" : "#f87171"
                        }}
                      >
                        {Math.abs(Number(crypto.price_change_percentage_24h)).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Company Modal */}
      {companyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold mb-4">Company Profile</h3>
            <p className="text-white/70 mb-6">
              GreenTech Exchange is a leading cryptocurrency trading platform...
            </p>
            <button
              onClick={() => setCompanyModal(false)}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}