"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiCpu, FiTrendingUp, FiUsers, FiGlobe, FiAward, FiMic, FiLayers, FiPocket, FiStar
} from "react-icons/fi";

export default function WealthPrograms() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 },
    }),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-green-900">
      
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-500 opacity-10"
            style={{
              width: Math.random() * 300 + 100 + "px",
              height: Math.random() * 300 + 100 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -50, 20, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              repeatType: "mirror",
              delay: Math.random() * 5,
            }}
          ></motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        
        {/* Hero */}
        <motion.div
          className="flex flex-col items-center justify-center text-center mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl mt-4 font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-cyan-300">
            Wealth Programs
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Explore AI-powered financial programs designed to grow your wealth through staking, trading, and intelligent rewards.
          </p>
        </motion.div>

        {/* Wealth Programs Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <FiPocket />, title: "AI-Powered Staking Plans", desc: "Earn USDT daily, weekly, or monthly with flexible 7, 21, and 30-day cycles." },
              { icon: <FiCpu />, title: "Quantum AI Trading Engine", desc: "Neural algorithms that scan markets 24/7 for profitable opportunities." },
              { icon: <FiStar />, title: "Dual-Earning Advantage", desc: "Combine Staking + AI Trading for maximized passive income." },
              { icon: <FiUsers />, title: "Referral Wealth Network", desc: "Multi-level rewards with smart commission bypass rules." },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="bg-gray-900/50 p-6 rounded-xl border border-green-400/10 hover:border-green-400/30 transition-all backdrop-blur-sm shadow-md"
              >
                <div className="text-4xl text-green-400 mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-green-300 mb-2">{item.title}</h3>
                <p className="text-green-100">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Upcoming Features (Roadmap) */}
        <motion.section
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="flex items-center mb-10">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-blue-400"></div>
            <h2 className="mx-4 text-3xl font-bold text-blue-300 flex items-center">
              <FiLayers className="mr-2" /> Upcoming Features
            </h2>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/20 shadow-lg shadow-blue-500/10 relative">
            <ul className="space-y-12">
              {[
                { year: "2026 Q4", title: "FPX Token Launch", desc: "Staking, governance, and rewards.", icon: <FiTrendingUp /> },
                { year: "2027", title: "Quantum AI v2", desc: "Advanced predictive trading algorithms.", icon: <FiCpu /> },
                { year: "2028", title: "DAO Investment Pools", desc: "Community-driven decentralized wealth.", icon: <FiUsers /> },
                { year: "2029", title: "Metaverse Lounge", desc: "3D hub for AI-driven investment events.", icon: <FiGlobe /> },
                { year: "2030", title: "AI Voice Trading", desc: 'Command wealth: "Stake 200 USDT" → executed instantly.', icon: <FiMic /> },
                { year: "Beyond 2030", title: "Fortune Evolution", desc: "Interplanetary blockchain & AI superintelligence.", icon: <FiAward /> }
              ].map((item, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="relative pl-16"
                >
                  <div className="absolute left-0 rounded-full bg-blue-500 p-2 transform -translate-x-1/2 border-4 border-gray-900">
                    {item.icon}
                  </div>
                  <div className="bg-gray-900/70 p-6 rounded-xl border border-blue-400/20 hover:border-blue-400/40 transition-all backdrop-blur-sm shadow-md">
                    <span className="text-blue-400 font-semibold">{item.year}</span>
                    <h3 className="text-xl font-bold text-blue-300 mt-1">{item.title}</h3>
                    <p className="text-green-100 mt-2">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
