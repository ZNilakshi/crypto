"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { Lock } from "lucide-react";

import {
  User,
  Calendar,
  Wallet,
  Mail,
  Award,
  CreditCard,
  Copy,
  Key,
  HelpCircle,
  LogOut,
  Settings,
  Gift
} from "lucide-react";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  referralCode: string;
  createdAt: string;
  cryptoAddress?: string;
  walletType?: string;
  level?: number;
  securityPasswordSet?: boolean; // Add this

}

// Define proper error response type
interface ErrorResponse {
  message: string;
}

// Define help tab type
type HelpTabType = "getting" | "wallet" | "layer" | "community";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(false);
  const router = useRouter();
  const [newAddress, setNewAddress] = useState("");
  const [walletType, setWalletType] = useState("");
  const [activeTab, setActiveTab] = useState("change password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  

  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    show: false,
    message: "",
    severity: "info",
  });

  const [helpTab, setHelpTab] = useState<HelpTabType>("getting");

  const [currentSecPass, setCurrentSecPass] = useState("");
  const [newSecPass, setNewSecPass] = useState("");
  const [confirmNewSecPass, setConfirmNewSecPass] = useState("");

  const referralLink = user
    ? `${APP_URL}/auth/register?ref=${user.referralCode}`
    : "";

  // Show alert function
  const showAlert = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setAlert({ show: true, message, severity });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // ✅ Init particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // ✅ Load user
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
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    showAlert("✅ Referral link copied!", "success");
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleChangeAddress = async () => {
    if (!newAddress || !walletType) {
      showAlert("❌ Please enter address and select wallet type", "error");
      return;
    }

    setShowLoading(true);
    try {
      const token = await getIdToken(auth.currentUser!);
      await axios.post(
        `${API_BASE_URL}/api/users/change-address`,        
        { cryptoAddress: newAddress, walletType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("✅ Address updated successfully!", "success");
      setNewAddress("");
      setWalletType("");
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        showAlert("❌ " + (err.response?.data?.message || err.message), "error");
      } else {
        showAlert("❌ An unexpected error occurred", "error");
      }
    } finally {
      setShowLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showAlert("❌ Please enter your current password", "error");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showAlert("❌ New passwords do not match!", "error");
      return;
    }
    
    setShowLoading(true);
    try {
      const token = await getIdToken(auth.currentUser!);
      await axios.post(
        `${API_BASE_URL}/api/users/change-password`,        
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("✅ Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        showAlert("❌ " + (err.response?.data?.message || "An error occurred"), "error");
      } else {
        showAlert("❌ An unexpected error occurred", "error");
      }
    } finally {
      setShowLoading(false);
    }
  };

  const handleChangeSecurityPassword = async () => {
    // For first-time setup, no current password needed
    // For changes, require current password
    if (user?.securityPasswordSet && !currentSecPass) {
      showAlert("❌ Please enter your current security password", "error");
      return;
    }
    
    if (newSecPass !== confirmNewSecPass) {
      showAlert("❌ Security passwords do not match!", "error");
      return;
    }
  
    if (newSecPass.length < 6) {
      showAlert("❌ Security password must be at least 6 characters long", "error");
      return;
    }
  
    setShowLoading(true);
    try {
      const token = await getIdToken(auth.currentUser!);
      const response = await axios.post(
        `${API_BASE_URL}/api/users/change-security-password`,        
        {
          currentSecurityPassword: user?.securityPasswordSet ? currentSecPass : undefined,
          newSecurityPassword: newSecPass,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showAlert(response.data.message, "success");
      
      // Reset form and update user state
      setCurrentSecPass("");
      setNewSecPass("");
      setConfirmNewSecPass("");
      
      // Update user security password status
      if (user) {
        setUser({ ...user, securityPasswordSet: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        showAlert("❌ " + (err.response?.data?.message || "An error occurred"), "error");
      } else {
        showAlert("❌ An unexpected error occurred", "error");
      }
    } finally {
      setShowLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Alert Notification */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <Alert
              severity={alert.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlert(prev => ({ ...prev, show: false }));
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: '12px',
                alignItems: 'center',
                '& .MuiAlert-message': {
                  padding: '8px 0',
                }
              }}
            >
              {alert.message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Cube Loading Animation */}
      <AnimatePresence>
        {showLoading && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 perspective-[800px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 3D Pastel Cube with Green */}
            <motion.div
              className="relative w-24 h-24"
              animate={{ 
                rotateX: 360, 
                rotateY: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotateX: { repeat: Infinity, duration: 4, ease: "linear" },
                rotateY: { repeat: Infinity, duration: 3, ease: "linear", delay: 0.2 },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
            >
              {/* Cube faces */}
              {["front", "back", "left", "right", "top", "bottom"].map((face) => (
                <div
                  key={face}
                  className={`
                    absolute w-24 h-24 border-4 bg-white/30
                    shadow-[0_0_20px_rgba(255,255,255,0.3)] flex justify-center items-center
                  `}
                  style={{
                    borderColor: 
                      face === "front" ? "#A7F3D0" : 
                      face === "back" ? "#D6EFFF" : 
                      face === "right" ? "#FFEFD6" : 
                      face === "left" ? "#E7D6FF" : 
                      face === "top" ? "#D6FFEF" : "#A7F3D0",
                    transform:
                      face === "front"
                        ? "translateZ(48px)"
                        : face === "back"
                        ? "rotateY(180deg) translateZ(48px)"
                        : face === "right"
                        ? "rotateY(90deg) translateZ(48px)"
                        : face === "left"
                        ? "rotateY(-90deg) translateZ(48px)"
                        : face === "top"
                        ? "rotateX(90deg) translateZ(48px)"
                        : "rotateX(-90deg) translateZ(48px)",
                  }}
                />
              ))}
              
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-green-200/20 rounded-lg shadow-[inset_0_0_50px_rgba(167,243,208,0.4)] animate-pulse" />
            </motion.div>

            {/* Enhanced Progress Bar with Green Gradient */}
            <div className="w-64 h-3 bg-green-300 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                className="h-3 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
                onUpdate={(latest) => {
                  const width = parseInt((latest as {width: string}).width);
                  setProgressPercent(width);
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-white/30"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              
              {/* Progress Percentage */}
              <div className="absolute -top-6 text-white font-bold text-sm" style={{ left: `${progressPercent}%` }}>
                {progressPercent}%
              </div>
            </div>
            
            <p className="mt-4 text-white font-semibold text-lg drop-shadow-[0_0_10px_rgba(167,243,208,0.5)]">
              Processing...
            </p>
            
            {/* Particles around loader */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-300 rounded-full"
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i / 15) * Math.PI * 2) * 100,
                  y: Math.sin((i / 15) * Math.PI * 2) * 100,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: "0 0 10px 2px rgba(167,243,208,0.7)"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen rounded-3xl text-black bg-emerald-900 p-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

      
        <motion.div
          className="relative max-w-6xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-r from-emerald-700/80 to-teal-700/80 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-2xl text-white relative overflow-hidden border border-white/10"
          >
            {/* Glow Orbs */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 to-transparent"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center shadow-lg border-4 border-white/20">
                  <span className="text-4xl font-bold text-white">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full shadow border-2 border-white">
                  <User size={16} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-2"
                >
                  {user.username}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-emerald-100 flex items-center justify-center md:justify-start gap-2 mt-1"
                >
                  <Mail size={16} />
                  {user.email}
                </motion.p>

                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm">
                    <Calendar size={14} />
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-sm flex items-center gap-1 shadow-sm backdrop-blur-sm">
                    <Award size={14} />
                    Level: #{user.level || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Details Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 lg:col-span-1"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <User className="text-white" size={20} />
                </div>
                Profile Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CreditCard className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Crypto Address</p>
                    <p className="text-white font-medium">{user.cryptoAddress || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Wallet className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Wallet Type</p>
                    <p className="text-white font-medium">{user.walletType || "TRC20"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Award className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Member Since</p>
                    <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referral Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 lg:col-span-1"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Gift className="text-white" size={20} />
                </div>
                Refer & Earn
              </h2>

              <p className="text-emerald-200 mb-4">
                Invite friends with your unique referral link!
              </p>

              <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 p-4 rounded-2xl mb-4 border border-white/10 flex justify-between items-center">
                <span className="text-sm text-white font-medium">Your Code: {user.referralCode}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-shadow"
                  aria-label="Copy referral link"
                >
                  <Copy size={18} />
                </motion.button>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white/10 p-4 rounded-2xl shadow-md border border-white/10 mb-3">
                  <QRCodeCanvas
                    value={referralLink}
                    size={140}
                    bgColor="rgba(255,255,255,0.1)"
                    fgColor="#FFFFFF"
                    level="M"
                  />
                </div>
                <p className="text-sm text-emerald-200 text-center">
                  Scan to share your referral code
                </p>
              </div>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10 lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Settings className="text-white" size={20} />
                </div>
                Account Settings
              </h2>

              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "change password", label: "Password", icon: Key },
                  { id: "change address", label: "Address", icon: CreditCard },
                  { id: "security password", label: "Security", icon: Lock },
                  { id: "help", label: "Help", icon: HelpCircle }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md" 
                          : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                      }`}
                    >
                      <IconComponent size={16} />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <AnimatePresence mode="wait">
                  {activeTab === "change password" && (
                    <motion.div
                      key="password"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white">Change Password</h3>
                      
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                      />

                      <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                      />
                      
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                      />
                      
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleChangePassword}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        Change Password
                      </motion.button>
                    </motion.div>
                  )}

                  {activeTab === "change address" && (
                    <motion.div
                      key="address"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white">Update Crypto Address</h3>
                      
                      <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-lg">
                        <p className="text-sm text-amber-100 flex items-start gap-2">
                          <span className="text-amber-300 font-bold">⚠️</span>
                          Cannot change address again after submission
                        </p>
                      </div>

                      <input
                        type="text"
                        placeholder="Enter Crypto Address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                      />

                      <select
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                        value={walletType}
                        onChange={(e) => setWalletType(e.target.value)}
                      >
                        <option value="" className="bg-gray-800" disabled>Select Wallet Type</option>
                        <option value="TRC20" className="bg-gray-800">TRC20 Address</option>
                        <option value="BEP20" className="bg-gray-800">BEP20 Address</option>
                      </select>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleChangeAddress}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        Update Address
                      </motion.button>
                    </motion.div>
                  )}

{activeTab === "security password" && (
  <motion.div
    key="security"
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 30 }}
    transition={{ duration: 0.4 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-white">
      {user.securityPasswordSet ? "Change Security Password" : "Set Security Password"}
    </h3>
    
    {/* Only show current password field if security password is already set */}
    {user.securityPasswordSet && (
      <>
        <input
          type="password"
          placeholder="Current Security Password"
          value={currentSecPass}
          onChange={(e) => setCurrentSecPass(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
        />
        
        <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-lg">
          <p className="text-xs text-emerald-100">
            Enter your current security password
          </p>
        </div>
      </>
    )}
    
    {/* For first-time setup, show different message */}
    {!user.securityPasswordSet && (
      <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
        <p className="text-xs text-blue-100">
          🔒 You&apos;re setting up your security password for the first time. 
          This will be used for sensitive operations.
        </p>
      </div>
    )}

    <input
      type="password"
      placeholder={user.securityPasswordSet ? "New Security Password" : "Set Security Password"}
      value={newSecPass}
      onChange={(e) => setNewSecPass(e.target.value)}
      className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
    />
    
    <input
      type="password"
      placeholder={user.securityPasswordSet ? "Confirm New Security Password" : "Confirm Security Password"}
      value={confirmNewSecPass}
      onChange={(e) => setConfirmNewSecPass(e.target.value)}
      className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/70 focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
    />

    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleChangeSecurityPassword}
      className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all"
    >
      {user.securityPasswordSet ? "Change Security Password" : "Set Security Password"}
    </motion.button>
  </motion.div>
)}

                  {activeTab === "help" && (
                    <motion.div
                      key="help"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white">Help Center</h3>

                      {/* Help Sub Tabs */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "getting", label: "Getting Started" },
                          { id: "wallet", label: "Wallet Guide" },
                          { id: "layer", label: "Layer Guide" },
                          { id: "community", label: "Community" }
                        ].map((tab) => (
                          <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setHelpTab(tab.id as HelpTabType)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              helpTab === tab.id
                                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                                : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                            }`}
                          >
                            {tab.label}
                          </motion.button>
                        ))}
                      </div>

                      {/* Help Content */}
                      <motion.div
                        key={helpTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/5 p-4 rounded-xl border border-white/10 mt-3"
                      >
                        {helpTab === "getting" && (
                          <ul className="space-y-2 text-white">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Complete your profile setup
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Add funds to your wallet
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Explore active layers
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Join the community
                            </li>
                          </ul>
                        )}
                        {helpTab === "wallet" && (
                          <ul className="space-y-2 text-white">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Click &quot;Add Funds&quot; to deposit
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Use &quot;Withdraw&quot; to cash out
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Check balance in real-time
                            </li>
                          </ul>
                        )}
                        {helpTab === "layer" && (
                          <ul className="space-y-2 text-white">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              View current active layers
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Monitor layer status
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Activate new layers
                            </li>
                          </ul>
                        )}
                        {helpTab === "community" && (
                          <ul className="space-y-2 text-white">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Read recent posts
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Create your own posts
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-300 mt-1">•</span>
                              Connect with members
                            </li>
                          </ul>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Logout Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full mt-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </motion.div>
      </div>
      </div>
    </>
  );
}