// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  HomeIcon,
  BanknotesIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  UserIcon
} from "@heroicons/react/24/solid";
import Deposit from "../../admindashboard/deposit/page"; // ✅ Using your approvals page
import Withdraw from "../../admindashboard/withdraw/page"; // ✅ Using your approvals page
import Home from "../../admindashboard/home/page"; // ✅ A simple welcome page
import Users from "../../admindashboard/users/page"; // ✅ A placeholder for user management

import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

interface AdminUser {
  username: string;
  role: string;
  email?: string; // add optional fields if needed
}



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [init, setInit] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Particles background
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      setInit(true);
    });
  }, []);

  // ✅ Load admin user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        try {
          const res = await axios.post(`${API_URL}/auth/verify-email`, {
            idToken: token,
          });

          if (res.data.user.role !== "crypto_admin") {
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
        return <Home />;
        case "withdraw":
          return <Withdraw />;
          case "deposit":
            return <Users />;
            case "users":
            return <Deposit />;
      case "users":
        return (
          <div className="text-center text-green-200 font-bold text-xl">
            Manage Users (Coming Soon)
          </div>
        );
      
      default:
        return <Home />;
    }
  };

  const tabs = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "deposit", label: "Deposit", icon: BanknotesIcon },
    { key: "withdraw", label: "Withdraw", icon: ArrowUpTrayIcon },
    { key: "users", label: "Users", icon: UsersIcon },
  ];
  return (
    <div className="font-sans text-white min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-emerald-900 to-lime-900">
      {/* Background Particles */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute top-0 left-0 w-full h-full -z-10"
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
              modes: { repulse: { distance: 120 } },
            },
            particles: {
              color: { value: "rgb(134, 239, 172)" },
              links: {
                color: "rgb(134, 239, 172)",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              move: { enable: true, speed: 2 },
              number: { value: 500, density: { enable: true } },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 backdrop-blur-lg bg-green-900/100 border-b border-green-400 rounded-b-2xl shadow-[0_0_25px_rgba(34,197,94,0.5)] z-30">
        <div className="flex items-center space-x-4">
          <UserIcon className="w-7 h-7 text-green-300 drop-shadow-[0_0_10px_rgba(134,239,172,0.8)] cursor-pointer hover:scale-110 transition" />

          <h2 className="text-lg font-extrabold text-green-200 tracking-wide">
            Admin – {user.username}
          </h2>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pt-24 pb-20">
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
            </button>
          );
        })}
      </footer>
    </div>
  );
}
