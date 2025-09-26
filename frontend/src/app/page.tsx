"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, } from "react-icons/fi";
import { auth } from "./firebase";
import HelpPopup from "../components/Help";
import FAQPopup from "../components/Faq";
import {
  Users,
  DollarSign,
  HelpCircle,
  UserCircle,
  MessageSquare,
  Wallet,
  Clock,
} from "lucide-react";
import AboutContent from "../app/about/page";
import ServiceContent from "../app/services/page";
import ContactContent from "../app/contact/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import type { User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

// Loading Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="relative">
      {/* Outer spinning ring */}
      <motion.div
        className="w-20 h-20 border-4 border-transparent border-t-emerald-500 border-r-teal-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner spinning ring */}
      <motion.div
        className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-b-cyan-400 border-l-green-300 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Pulsing center dot */}
      <motion.div
        className="absolute top-7 left-7 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <motion.p
        className="text-center mt-4 text-emerald-200 font-semibold"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
      </motion.p>
    </div>
  </div>
);

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Floating particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          y: [0, -100, 0],
          x: [0, Math.random() * 100 - 50, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
    
    {/* Animated gradient orbs */}
    <motion.div
      className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl"
      animate={{
        x: [0, 50, 0],
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.div
      className="absolute -left-20 -bottom-20 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-400/20 rounded-full blur-3xl"
      animate={{
        x: [0, -50, 0],
        y: [0, 40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<"Gateway" | "Our Vision" | "Wealth Programs" | "Connect">("Gateway");
  const [role, setRole] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  // 🔄 Track user login + fetch role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await axios.post(`${API_URL}/auth/get-role`, {
            uid: currentUser.uid,
          });
          setRole(res.data.role);
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats/active-users`);
        setActiveUsers(res.data.displayUsers);
      } catch (err) {
        console.error("Error fetching active users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handlePageChange = (page: typeof activePage) => {
    setContentLoading(true);
    setActivePage(page);
    // Simulate loading delay for smooth transition
    setTimeout(() => setContentLoading(false), 600);
  };

  // ✅ Decide dashboard path based on role
  const dashboardPath =
    role === "crypto_admin" ? "/dashboard/crypto" : "/dashboard/user";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <AnimatedBackground />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-green-950/70 backdrop-blur-md text-white z-50 shadow-lg border-b border-green-800/40"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="text-sm font-extrabold text-transparent bg-gradient-to-r from-green-400 via-teal-300 to-emerald-400 bg-clip-text drop-shadow-lg"
          >
            FortunePathWeb.com
          </motion.h1>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { label: "Gateway", page: "Gateway" as const },
              { label: "Our Vision", page: "Our Vision" as const },
              { label: "Wealth Programs", page: "Wealth Programs" as const },
              { label: "Connect", page: "Connect" as const },
            ].map((link) => (
              <motion.button
                key={link.page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(link.page)}
                className={`relative text-lg font-medium transition-all duration-300 ${
                  activePage === link.page
                    ? "text-green-400 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-green-400"
                    : "text-white hover:text-green-300"
                }`}
              >
                {link.label}
              </motion.button>
            ))}

            {/* ✅ Conditional Login/Logout */}
            {!user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/login"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] hover:scale-110 transition"
                >
                  Login
                </Link>
              </motion.div>
            ) : (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-800/50 hover:bg-green-700 transition"
                >
                  <UserCircle className="w-6 h-6 text-white" />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-green-900/95 border border-green-700 text-white rounded-lg shadow-lg z-50 backdrop-blur-md"
                    >
                      <Link
                        href={dashboardPath}
                        className="block px-4 py-2 hover:bg-green-700 rounded-t-lg transition"
                        onClick={() => setProfileOpen(false)}
                      >
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-600 rounded-b-lg transition"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-green-400"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="md:hidden fixed w-full h-screen bg-green-950/95 backdrop-blur-md flex flex-col items-center justify-center space-y-6 z-50"
            >
              {(["Gateway", "Our Vision", "Wealth Programs", "Connect"] as const).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handlePageChange(page);
                    setMenuOpen(false);
                  }}
                  className="text-white text-xl font-semibold hover:text-green-300 transition"
                >
                  {page}
                </motion.button>
              ))}

              {!user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/login"
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-full shadow-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center space-y-2 mt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={dashboardPath}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg"
                  >
                    Logout
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {contentLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              {activePage === "Gateway" && (
                <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-emerald-950 to-black text-white min-h-screen">
                  {/* Enhanced Glow Orbs */}
                  <motion.div
                    className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-[100px]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -left-16 bottom-0 w-80 h-80 bg-teal-400/30 rounded-full blur-[120px]"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />

                  {/* Hero Content */}
                  <div className="relative z-10 text-center max-w-4xl px-6 space-y-6 mt-20">
                    <motion.span
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-teal-300 text-4xl md:text-6xl font-semibold block mb-4"
                    >
                      FortunePathWeb.com
                    </motion.span>
                    
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="text-sm md:text-xl font-extrabold tracking-tight 
                      bg-gradient-to-r from-green-400 via-teal-300 to-emerald-400 
                      bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.7)]"
                    >
                      Where AI & Blockchain Create Tomorrow&apos;s Millionaires
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                      className="text-lg md:text-xl text-emerald-100 drop-shadow-[0_0_10px_rgba(20,184,166,0.6)] leading-relaxed"
                    >
                      Step into the future of wealth creation, powered by Quantum AI Trading and next-gen crypto staking.
                      We don&apos;t just secure your crypto — we accelerate it into the world of limitless opportunity.
                    </motion.p>

                    {/* Enhanced Call-to-Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.7 }}
                      className="flex flex-col-2 sm:flex-row gap-4 justify-center mt-8 w-full"
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/auth/register"
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] text-white font-semibold hover:shadow-[0_0_35px_rgba(45,212,191,0.9)] transition-all duration-300"
                        >
                          Get Started 
                        </Link>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={dashboardPath}
                          className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-emerald-400 rounded-full text-emerald-200 font-semibold bg-black/20 hover:bg-emerald-800/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(20,184,166,0.7)]"
                        >
                          Your Profile
                        </Link>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.7 }}
                    className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-26 max-w-5xl px-6"
                  >
                    {[
                      { 
                        icon: Users, 
                        label: "Visionaries", 
                        value: activeUsers !== null ? activeUsers.toLocaleString() : "34k+" 
                      },
                      { icon: DollarSign, label: "AI-Driven Trades", value: "120M+" },
                      { icon: Wallet, label: "Wealth Empowered", value: "$250M+" },
                      { icon: Clock, label: "Hyper Reliability", value: "99.9%" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -5,
                          boxShadow: "0 0 30px rgba(20,184,166,0.7)"
                        }}
                        className="bg-emerald-900/20 backdrop-blur-lg p-6 rounded-2xl border border-emerald-500/30 shadow-lg transition-all duration-300"
                      >
                        <stat.icon className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-2xl font-bold text-emerald-300">
                          {stat.value}
                        </p>
                        <p className="text-sm text-emerald-100">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {activePage === "Our Vision" && <AboutContent />}
              {activePage === "Wealth Programs" && <ServiceContent />}
              {activePage === "Connect" && <ContactContent />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-0 left-0 w-full text-xs bg-gradient-to-r from-green-950 via-emerald-900 to-green-950 backdrop-blur-md border-t border-green-800/40 text-white z-40"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2 text-sm">
          <p className="text-xs">
            ©️ 2025 FortunePathWeb.com — Pioneering the Future of Intelligent Wealth.
          </p>
          <div className="flex space-x-6">
            <motion.button 
              whileHover={{ scale: 1.1, color: "#facc15" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHelpOpen(true)} 
              className="flex items-center space-x-1 transition"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: "#facc15" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFaqOpen(true)} 
              className="flex items-center space-x-1 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>FAQ</span>
            </motion.button>
          </div>
        </div>
      </motion.footer>

      <AnimatePresence>
        {helpOpen && <HelpPopup onClose={() => setHelpOpen(false)} />}
        {faqOpen && <FAQPopup onClose={() => setFaqOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}