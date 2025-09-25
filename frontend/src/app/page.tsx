"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiArrowRight, FiBarChart2 } from "react-icons/fi";
import { auth } from "./firebase";
import HelpPopup from "../components/Help";
import FAQPopup from "../components/Faq";
import {
  Users,
  Globe,
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
import { motion } from "framer-motion";

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
        setActiveUsers(res.data.displayUsers); // show boosted count
      } catch (err) {
        console.error("Error fetching active users:", err);
      }
    };
    fetchUsers();
  }, []);
  // ✅ Decide dashboard path based on role
  const dashboardPath =
    role === "crypto_admin" ? "/dashboard/crypto" : "/dashboard/user";

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-green-950/70 backdrop-blur-md text-white z-50 shadow-lg border-b border-green-800/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-sm font-extrabold text-transparent bg-gradient-to-r from-green-400 via-teal-300 to-emerald-400 bg-clip-text drop-shadow-lg">
          FortunePathWeb.com
          </h1>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { label: "Gateway", page: "Gateway" as const },
              { label: "Our Vision", page: "Our Vision" as const },
              { label: "Wealth Programs ", page: "Wealth Programs" as const },
              { label: "Connect", page: "Connect" as const },
            ].map((link) => (
              <button
                key={link.page}
                onClick={() => setActivePage(link.page)}
                className={`relative text-lg font-medium transition-all duration-300 ${
                  activePage === link.page
                    ? "text-green-400 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-green-400"
                    : "text-white hover:text-green-300"
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* ✅ Conditional Login/Logout */}
            {!user ? (
              <Link
                href="/auth/login"
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] hover:scale-110 transition"
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-800/50 hover:bg-green-700 transition"
                >
                  <UserCircle className="w-6 h-6 text-white" />
                  <span className="hidden md:inline">
                    {user.displayName || "Profile"}
                  </span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-green-900/95 border border-green-700 text-white rounded-lg shadow-lg z-50 backdrop-blur-md">
                    <Link
                      href={dashboardPath}
                      className="block px-4 py-2 hover:bg-green-700 rounded-t-lg"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-600 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-green-400"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden fixed w-full h-screen bg-green-950/95 backdrop-blur-md flex flex-col items-center justify-center space-y-6 z-50">
            {(["Gateway", "Our Vision", "Wealth Programs", "Connect"] as const).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setActivePage(page);
                  setMenuOpen(false);
                }}
                className="text-white text-xl font-semibold hover:text-green-300"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}

            {!user ? (
              <Link
                href="/auth/login"
                className="mt-4 px-8 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            ) : (
              <div className="flex flex-col items-center space-y-2 mt-4">
                <Link
                  href={dashboardPath}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {activePage === "Gateway" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-emerald-950 to-black text-white"
          >
            {/* Glow Orbs */}
            <div className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute -left-16 bottom-0 w-80 h-80 bg-teal-400/30 rounded-full blur-[120px] animate-ping"></div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl px-6 space-y-6 mt-20">
             
            <span className="text-teal-300 text-4xl md:text-6xl font-semibold">FortunePathWeb.com </span>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-sm md:text-xl font-extrabold tracking-tight 
                bg-gradient-to-r from-green-400 via-teal-300 to-emerald-400 
                bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.7)]"
              >
                {
                " "}
Where AI & Blockchain Create Tomorrow’s Millionaires            </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-lg md:text-xl text-emerald-100 drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]"
              >
                 {" "}
                Step into the future of wealth creation, powered by Quantum AI Trading and next-gen crypto staking.
                We don’t just secure your crypto — we accelerate it into the world of limitless opportunity.             
                </motion.p>

              {/* Call-to-Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="flex flex-row gap-4 justify-center mt-8 w-full"
              >
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] text-white font-semibold hover:scale-110 hover:shadow-[0_0_35px_rgba(45,212,191,0.9)] transition"
                >
                  Get Started
                </Link>
                <Link
                  href={dashboardPath}
                  className="flex items-center gap-2 px-8 py-3 border border-emerald-400 rounded-full text-emerald-200 font-semibold bg-black/20 hover:bg-emerald-800/40 transition hover:shadow-[0_0_25px_rgba(20,184,166,0.7)]"
                >
                  Your Profile
                </Link>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 mb-26 max-w-5xl px-6">
            {[
  { 
    icon: Users, 
    label: "Visionaries", 
    value: activeUsers !== null ? activeUsers.toLocaleString() : "340+" 
  },
  { icon: DollarSign, label: "AI-Driven Trades", value: "120M+" },
  { icon: Wallet, label: "Wealth Empowered", value: "$250M+" },
  { icon: Clock, label: "Hyper Reliability ", value: "99.9%" },
]
.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-emerald-900/20 backdrop-blur-lg p-6 rounded-2xl border border-emerald-500/30 shadow-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.7)] transition"
                >
                  <stat.icon className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-emerald-300">
                    {stat.value}
                  </p>
                  <p className="text-sm text-emerald-100">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            
          </motion.div>
        )}

        {activePage === "Our Vision" && <AboutContent />}
        {activePage === "Wealth Programs" && <ServiceContent />}
        {activePage === "Connect" && <ContactContent />}
      </main>

      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full text-xs bg-gradient-to-r from-green-950 via-emerald-900 to-green-950 backdrop-blur-md fixedborder-t border-green-800/40 text-white z-50">
       
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2 text-sm">
          <p className="text-xs">
          ©️ 2025 FortunePathWeb.com — Pioneering the Future of Intelligent Wealth..</p>
          <div className="flex space-x-6">
            <button onClick={() => setHelpOpen(true)} className="flex items-center space-x-1 hover:text-yellow-400">
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
            <button onClick={() => setFaqOpen(true)} className="flex items-center space-x-1 hover:text-yellow-400">
              <MessageSquare className="w-4 h-4" />
              <span>FAQ</span>
            </button>
          </div>
        </div>
      </footer>

      {helpOpen && <HelpPopup onClose={() => setHelpOpen(false)} />}
      {faqOpen && <FAQPopup onClose={() => setFaqOpen(false)} />}
    </div>
  );
}


