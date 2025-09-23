"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiTrendingUp, FiUsers, FiDollarSign, FiPieChart, 
  FiActivity,
} from "react-icons/fi";
import { 
  FaCoins, FaMoneyCheckAlt, FaUserFriends, FaLayerGroup, FaWallet
} from "react-icons/fa";

interface Referral {
  username: string;
  level: number;
  totalStakes: number;
  directReferrals: number;
  totalCommissionEarned: number;
  joinDate: string;
  walletBalance?: number;
  layer: number;
  referredByUsername?: string;
}
interface UserData {
  layer1_3Commissions: number;
  layer4_6Commissions: number;
  leaderBonus: number;
  referrals?: Referral[];
}
interface AuthUser {
  id: string;
  email: string;
  username?: string;
}
type CommissionRow = {
  level: string;
  layer1to3: number;
  layer4to6: number;
};

type ProgramRow = {
  level: string;
  requirement: string;
  directReferrals: string;
  progression: string;
  indirect1to3: string;
  indirect4to6: string;
};

export default function LayersPage() {
  const [activeTab, setActiveTab] = useState("commission");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login");
        return;
      }

      try {
        const token = await getIdToken(firebaseUser, true);

        // ✅ verify and fetch dashboard in parallel
        const [verifyRes, dashboardRes] = await Promise.all([
          axios.post(`${API_URL}/auth/verify-email`, { idToken: token }),
          axios.get(`${API_URL}/auth/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(verifyRes.data.user);

        if (dashboardRes.data.success) {
          setUserData(dashboardRes.data);
          setReferrals(dashboardRes.data.referrals || []);
        }
      } catch (err) {
        console.error("Auth/dashboard error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, API_URL]);

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-emerald-600">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) return null;

  const balances: Record<string, number> = {
    "Layer 1-3 Commissions": userData?.layer1_3Commissions || 0,
    "Layer 4-6 Commissions": userData?.layer4_6Commissions || 0,
    "Leader Bonus": userData?.leaderBonus || 0,
  };
  const commissionData = [
    { level: "Level 0", layer1to3: 0.0, layer4to6: 0.0 },
    { level: "Level 1", layer1to3: 0.4, layer4to6: 0.3 },
    { level: "Level 2", layer1to3: 0.5, layer4to6: 0.4 },
    { level: "Level 3", layer1to3: 0.6, layer4to6: 0.5 },
    { level: "Level 4", layer1to3: 0.7, layer4to6: 0.6 },
    { level: "Level 5", layer1to3: 0.8, layer4to6: 0.7 },
    { level: "Level 6", layer1to3: 0.9, layer4to6: 0.8 },
  ];

  const programDetails = [
    { level: "Level 0", requirement: "Starting level", directReferrals: "0", progression: "N/A", indirect1to3: "0.0%", indirect4to6: "0.0%" },
    { level: "Level 1", requirement: "From Level 0", directReferrals: "5 with deposits", progression: "N/A", indirect1to3: "0.4%", indirect4to6: "0.3%" },
    { level: "Level 2", requirement: "From Level 1", directReferrals: "0", progression: "2 members in Layer 1 reach Level 1", indirect1to3: "0.5%", indirect4to6: "0.4%" },
    { level: "Level 3", requirement: "From Level 2", directReferrals: "0", progression: "2 members in Layer 2 reach Level 2", indirect1to3: "0.6%", indirect4to6: "0.5%" },
    { level: "Level 4", requirement: "From Level 3", directReferrals: "0", progression: "2 members in Layer 3 reach Level 3", indirect1to3: "0.7%", indirect4to6: "0.6%" },
    { level: "Level 5", requirement: "From Level 4", directReferrals: "0", progression: "2 members in Layer 4 reach Level 4", indirect1to3: "0.8%", indirect4to6: "0.7%" },
    { level: "Level 6", requirement: "From Level 5", directReferrals: "0", progression: "3 members in Layer 5 reach Level 5", indirect1to3: "0.9%", indirect4to6: "0.8%" },
  ];
  const tabs = [
    { key: "commission", label: "Commission Structure", icon: <FiTrendingUp /> },
    { key: "program", label: "Program Details", icon: <FiPieChart /> },
    { key: "details", label: "My Referrals", icon: <FiUsers /> },
  ];
  return (
    <div className="min-h-screen rounded-3xl text-black bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEwIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 pt-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent flex items-center justify-center gap-3"
          >
            <FaCoins className="text-teal-300" />
            Referral Rewards Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-200 font-medium max-w-2xl mx-auto"
          >
            Track your commissions, program progress, and staking details all in one place.
          </motion.p>
        </motion.div>

        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden border border-emerald-500/30"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 opacity-20">
            <FiDollarSign size={80} />
          </div>
          
          <div className="relative z-10 text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-semibold flex items-center justify-center gap-2 text-emerald-100"
            >
              <FiActivity /> TOTAL COMMISSION BALANCE
            </motion.h2>
            <motion.p 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold mt-2 text-white"
            >
              {(
                (userData?.layer1_3Commissions || 0) +
                (userData?.layer4_6Commissions || 0) +
                (userData?.leaderBonus || 0)
              ).toFixed(2)}{" "}
              <span className="text-xl font-semibold text-emerald-100">USDT</span>
            </motion.p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition-all shadow-md flex items-center gap-2 mx-auto"
            >
              <FiDollarSign /> Withdraw Earnings
            </motion.button>
          </div>
        </motion.div>

        {/* Balance Breakdown Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {Object.entries(balances).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-emerald-800/80 to-teal-800/80 rounded-xl p-4 shadow-lg border border-emerald-600/30 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm font-medium">{key}</p>
                  <p className="text-xl font-bold mt-1">{value}</p>
                </div>
                <div className="bg-emerald-700/50 p-2 rounded-lg">
                  <FaMoneyCheckAlt className="text-emerald-200" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap gap-2 justify-center bg-emerald-900/50 p-2 rounded-xl backdrop-blur-sm"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                  : "bg-emerald-800/40 text-emerald-200 hover:bg-emerald-700/60"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-100"
          >
            {activeTab === "commission" && (
              <Table title="Commission Structure" data={commissionData} type="commission" />
            )}
            {activeTab === "program" && (
              <Table title="Referral Program Details" data={programDetails} type="program" />
            )}
          
            {activeTab === "details" && (
              <ReferralDetails referrals={referrals} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
function Table({ title, data, type }: { title: string; data: CommissionRow[] | ProgramRow[]; type: "commission" | "program" }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-emerald-800 text-center mb-6 flex items-center justify-center gap-2">
        {type === "commission" ? <FiTrendingUp className="text-teal-600" /> : <FiPieChart className="text-teal-600" />}
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-emerald-100">
        <table className="w-full border-collapse text-emerald-800 text-sm">
          <thead className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900">
            <tr>
              {Object.keys(data[0]).map((key, i) => (
                <th key={i} className="border-b border-emerald-200 px-4 py-3 text-left font-semibold">
                  {key.split(/(?=[A-Z])/).join(' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`border-b border-emerald-100 last:border-b-0 hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50'}`}
              >
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-4 py-3">{typeof val === 'number' ? val.toFixed(1) : String(val)}</td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* Referrals Table */
function ReferralDetails({ referrals,   }: { referrals: Referral[] }) {
  const grouped = referrals.reduce((acc: Record<number, Referral[]>, ref) => {
    if (!acc[ref.layer]) acc[ref.layer] = [];
    acc[ref.layer].push(ref);
    return acc;
  }, {});
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FaUserFriends /> My Referrals</h2>
      </div>

      {Object.entries(grouped).map(([layer, list]) => (
        <div key={layer} className="mb-6  overflow-x-auto border border-emerald-200 rounded-lg">
          <div className="bg-emerald-100  px-4 py-2 font-semibold  gap-2">
            <FaLayerGroup /> Layer {layer} ({list.length})
          </div>
          <table className="w-full  text-sm">
          <thead className="bg-emerald-50">
  <tr>
    <th className="p-2 text-left">Username</th>
    <th className="p-2">Referrer</th> 
    <th className="p-2">Level</th>
    <th className="p-2">Direct Refs</th>
    <th className="p-2">Wallet</th>
    <th className="p-2">Joined</th>
  </tr>
</thead>
<tbody>
  {list.map((r, i) => (
    <tr key={i} className="border-t">
      <td className="p-2 font-medium">{r.username}</td>
      <td className="p-2 font-medium">{r.referredByUsername}</td> 
      <td className="p-2">Lvl {r.level}</td>
      <td className="p-2">{r.directReferrals}</td>
      <td className="p-2 flex items-center gap-1"><FaWallet /> {r.walletBalance ?? 0} USDT</td>
      <td className="p-2">{new Date(r.joinDate).toLocaleDateString()}</td>
    </tr>
  ))}
</tbody>


          </table>
        </div>
      ))}
    </div>
  );
}

