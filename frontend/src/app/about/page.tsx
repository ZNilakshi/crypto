"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiTarget, FiStar, FiUsers, FiGlobe, FiShield, FiTrendingUp,
  FiCpu, FiPocket, FiMessageSquare, FiAward, FiLayers, FiMic
} from "react-icons/fi";

export default function AboutContent() {
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
      
      {/* Animated Background Blobs */}
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

      {/* Geometric Shapes */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-green-600 rounded-full mix-blend-screen opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 -right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen opacity-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500 rounded-lg rotate-45 opacity-10"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center justify-center text-center mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl mt-4 md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-cyan-300 text-glow">
            About FortunePath
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            We&apos;re not just redefining wealth—we&apos;re building the future of intelligent finance through AI and blockchain technology.
          </p>
        </motion.div>

        {/* Our Vision Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="flex items-center mb-10">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-green-400"></div>
            <h2 className="mx-4 text-3xl font-bold text-green-300 flex items-center">
              <FiTarget className="mr-2" /> Our Vision
            </h2>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-green-400"></div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-green-400/20 shadow-lg shadow-green-500/10">
            <p className="text-lg text-green-100 mb-6">
              To reimagine wealth itself — transforming digital assets into a living, intelligent ecosystem where prosperity is limitless, borderless, and timeless.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <FiCpu />, title: "AI Wealth Architecture", desc: "Artificial Intelligence becomes the ultimate wealth architect, analyzing and predicting markets beyond human reach." },
                { icon: <FiShield />, title: "Blockchain Foundation", desc: "Blockchain becomes the unshakable foundation of trust, securing every transaction with absolute transparency." },
                { icon: <FiUsers />, title: "Community Growth", desc: "Communities thrive together, powered by referral intelligence that multiplies opportunity." },
                { icon: <FiGlobe />, title: "Global Accessibility", desc: "Wealth is no longer exclusive, but accessible to every pioneer bold enough to embrace the future." },
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
            <p className="text-center mt-8 text-green-200 font-semibold">
              Our vision is not just to lead in crypto — but to become the global superintelligence of finance, shaping the next century of wealth creation.
            </p>
          </div>
        </motion.section>

        {/* Our Mission Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="flex items-center mb-10">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-cyan-400"></div>
            <h2 className="mx-4 text-3xl font-bold text-cyan-300 flex items-center">
              <FiStar className="mr-2" /> Our Mission
            </h2>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-cyan-400"></div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/20 shadow-lg shadow-cyan-500/10">
            <p className="text-lg text-green-100 mb-6 text-center">
              To build the world&apos;s most advanced AI-powered financial ecosystem, delivering sustainable, intelligent, and luxurious wealth pathways for every member.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <FiTrendingUp />, title: "Dual Wealth Engines", desc: "AI trading precision + futuristic staking models." },
                { icon: <FiShield />, title: "Unbreakable Trust", desc: "Immutable ledgers, transparent growth, zero compromise on security." },
                { icon: <FiUsers />, title: "Intelligent Referral Matrix", desc: "A fair, rewarding network that empowers leaders and uplifts communities." },
                { icon: <FiCpu />, title: "Relentless Innovation", desc: "From quantum trading engines to metaverse investment hubs." },
                { icon: <FiGlobe />, title: "Global Prosperity", desc: "Making FortunePath a borderless wealth revolution available to all." },
                { icon: <FiAward />, title: "Luxury Experience", desc: "Designed for those who demand precision, exclusivity, and prosperity." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="bg-gray-900/50 p-5 rounded-xl border border-cyan-400/10 hover:border-cyan-400/30 transition-all backdrop-blur-sm shadow-md group"
                >
                  <div className="text-3xl text-cyan-400 mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">{item.title}</h3>
                  <p className="text-green-100">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-8 text-cyan-200 font-semibold">
              Our mission is not only to grow your assets, but to elevate your financial journey into the future of prosperity itself.
            </p>
          </div>
        </motion.section>

        {/* Why Join Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="flex items-center mb-10">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-purple-400"></div>
            <h2 className="mx-4 text-3xl font-bold text-purple-300 flex items-center">
              <FiPocket className="mr-2" /> Why Join FortunePath?
            </h2>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-purple-400"></div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20 shadow-lg shadow-purple-500/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: <FiTrendingUp />, title: "Dual Earning Systems",
                  desc: "AI Trading + Staking, giving you unstoppable growth."
                },
                {
                  icon: <FiGlobe />, title: "Global Intelligent Network",
                  desc: "Earn not only from your investment, but from the power of community."
                },
                { icon: <FiShield />, title: "Unmatched Security", desc: "Your funds are protected by blockchain and enhanced by AI defense systems." },
                { icon: <FiAward />, title: "Luxury Experience", desc: "Designed for those who demand precision, exclusivity, and prosperity." },
                { icon: <FiLayers />, title: "Future-Proof Roadmap", desc: "From quantum AI engines to metaverse wealth lounges, your journey never stops evolving." },
                { icon: <FiMessageSquare />, title: "Join the Movement", desc: "At FortunePath, you don't just invest — you become part of a movement toward infinite wealth." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="flex items-start bg-gray-900/50 p-4 rounded-xl border border-purple-400/10 hover:border-purple-400/30 transition-all backdrop-blur-sm shadow-md"
                >
                  <div className="bg-purple-500/20 p-3 rounded-lg mr-4 text-2xl text-purple-400">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-300 mb-1">{item.title}</h3>
                    <p className="text-green-100">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-green-100 mb-6">Your path to intelligent prosperity starts here.</p>
              <Link 
                href="https://www.FortunePathWeb.com" 
                className="inline-block bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Visit FortunePathWeb.com
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Roadmap Section */}
        <motion.section
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className="flex items-center mb-10">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-blue-400"></div>
            <h2 className="mx-4 text-3xl font-bold text-blue-300 flex items-center">
              <FiLayers className="mr-2" /> FortunePath AI Roadmap
            </h2>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/20 shadow-lg shadow-blue-500/10 relative">
            <div className="absolute left-4 h-full w-1 bg-blue-500/30 top-0 ml-3"></div>
            <ul className="space-y-12">
              {[
                { year: "2026 Q4", title: "FPX Token Launch", desc: "FortunePath Exchange Token for staking, governance, and rewards.", icon: <FiTrendingUp /> },
                { year: "2027", title: "Quantum AI Investment Engine v2", desc: "Quantum-inspired predictive trading algorithms.", icon: <FiCpu /> },
                { year: "2028", title: "DAO-Controlled Investment Pools", desc: "Decentralized governance for community-driven wealth.", icon: <FiUsers /> },
                { year: "2029", title: "Fortune Metaverse Investment Lounge", desc: "A 3D metaverse hub where investors stake, network, and attend AI-driven events.", icon: <FiGlobe /> },
                { year: "2030", title: "AI Voice Assistant for Investment Commands", desc: 'Voice-activated investing: "Stake 200 USDT for 30 days" → Instantly executed.', icon: <FiMic /> },
                { year: "Beyond 2030", title: "The Fortune Evolution", desc: "Interplanetary blockchain networks. Thought-to-trade neuro-link execution. AI superintelligence managing wealth at planetary scale.", icon: <FiAward /> }
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

        {/* Final CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 text-glow">
            Welcome to the Future of Wealth
          </h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-10">
            FortunePath is not just a platform — it&apos;s a revolutionary AI-driven financial universe where your money doesn&apos;t sleep, it evolves.
          </p>
          <Link 
            href="https://www.FortunePathWeb.com" 
            className="inline-block bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30 text-lg"
          >
            Begin Your Journey at FortunePathWeb.com
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
