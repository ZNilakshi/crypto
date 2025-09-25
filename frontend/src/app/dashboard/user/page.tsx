"use client";

import { useState, useEffect } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import {
  HomeIcon,
  Squares2X2Icon,
  UserIcon,
  GlobeAltIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import ConnectedPage from "../../dashboard_pages/connected/page";
import HomePage from "../../dashboard_pages/home/page";
import LayersPage from "../../dashboard_pages/layers/page";
import VeultPage from "../../dashboard_pages/vault/page";
import UserPage from "../../dashboard_pages/user/page";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [init, setInit] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      setInit(true);
    });
  }, []);

  // ✅ Load user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        try {
          const res = await axios.post(`${API_URL}/auth/verify-email`, {
            idToken: token,
          });

          if (res.data.user.role !== "user") {
            router.push("/auth/login");
            return;
          }

          setUser(res.data.user);
        } catch {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "wallet":
        return <VeultPage />;
      case "layers":
        return <LayersPage />;
      case "news":
        return <ConnectedPage />;
      case "user":
        return <UserPage />;
      default:
        return <HomePage />;
    }
  };

  const tabs = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "wallet", label: "Wallet", icon: WalletIcon },   // safer vibe than lock
    { key: "layers", label: "Layers", icon: Squares2X2Icon },
    { key: "news", label: "News", icon: GlobeAltIcon }, // global/connection feel
    { key: "user", label: "User", icon: UserIcon },
  ];

  return (
    <div className="font-sans text-white min-h-screen relative overflow-hidden bg-gradient-to-br from-green-650 via-emerald-900 to-lime-900">
      {/* Background Particles */}
     

      {/* Navbar */}
     {/* Navbar */}
<nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 backdrop-blur-lg bg-green-900/100 border-b border-green-400 rounded-b-2xl shadow-[0_0_25px_rgba(34,197,94,0.5)] z-30">
  {/* Left side - user */}
  <div className="flex items-center space-x-4">
    <UserIcon className="w-7 h-7 text-green-300 drop-shadow-[0_0_10px_rgba(134,239,172,0.8)] cursor-pointer hover:scale-110 transition" />

   
  </div>

{/* Right side - Telegram + Download */}
<div className="flex items-center space-x-6">
  {/* Telegram button */}
  <a
    href="https://t.me/yourtelegramgroup" // <-- replace with your group link
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center text-green-300 hover:text-lime-400 transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-6 h-6 mb-0.5"
    >
      <path d="M9.964 15.64l-.396 5.58c.566 0 .81-.243 1.104-.534l2.652-2.523 5.502 4.029c1.01.557 1.725.264 1.986-.934l3.6-16.878c.327-1.512-.547-2.108-1.533-1.74L1.705 9.755c-1.475.573-1.453 1.392-.251 1.764l5.59 1.744L18.53 6.53c.63-.387 1.205-.173.732.214" />
    </svg>
    <span className="text-xs font-medium">Join To Telegram</span>
  </a>


</div>


</nav>


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto  pt-24 pb-20">
        {renderContent()}
      </main>

      {/* Footer Tabs */}
      <footer className="fixed bottom-0 left-0 w-full border-t border-green-400 bg-green-900/80 backdrop-blur-lg flex justify-around items-center py-1 px-2 shadow-[0_0_25px_rgba(34,197,94,0.5)] z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-col items-center transition-all duration-500 ${
                isActive
                  ? "text-green-300"
                  : "text-green-200 hover:text-lime-300"
              }`}
            >
              {isActive && (
                <div className="absolute -top-8 w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 via-emerald-400 to-lime-400 blur-xl opacity-60 animate-pulse"></div>
              )}

              <div
                className={`flex items-center justify-center rounded-full transition-all duration-500 relative z-10 ${
                  isActive
                    ? "bg-green-950 -translate-y-6 w-16 h-16 shadow-[0_0_25px_rgba(134,239,172,0.8)] border border-green-400"
                    : "w-10 h-10"
                }`}
              >
                <Icon
                  className={`transition-all duration-500 ${
                    isActive ? "w-8 h-8" : "w-6 h-6"
                  }`}
                />
              </div>
              <span
          className={`mt-1 text-xs font-medium transition-all duration-500 ${
            isActive ? "text-green-300" : "text-green-200"
          }`}
        >
          {tab.label}
        </span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}