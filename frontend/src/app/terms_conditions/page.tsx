"use client";
import { motion } from "framer-motion";
import { ShieldCheck, User, Key, Smartphone, FileText, AlertTriangle, RefreshCcw, Mail } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

// Terms with icons
const terms = [
  { icon: ShieldCheck, title: "Acceptance of Terms", desc: "By registering or using Lederblock, you confirm that you have read, understood, and agree to these terms." },
  { icon: User, title: "Eligibility", desc: "You must be 18 years or older. By registering, you confirm you meet this requirement." },
  { icon: Key, title: "Account Responsibilities", desc: "Keep your login credentials secure. Report unauthorized account access immediately." },
  { icon: Smartphone, title: "App Usage", desc: "You agree to use the app lawfully and avoid hacking, disrupting functionality, or sharing false/fraudulent information." },
  { icon: FileText, title: "OTP Verification", desc: "OTP verification is required for account access. Failure to verify may restrict use." },
  { icon: ShieldCheck, title: "Privacy Policy", desc: "Your data is handled as per our Privacy Policy. By using Lederblock, you consent to it." },
  { icon: AlertTriangle, title: "Limitation of Liability", desc: "Lederblock is not liable for service interruptions or errors." },
  { icon: RefreshCcw, title: "Modifications", desc: "We may update these terms. Continued use of the app implies acceptance of changes." },
  { icon: Mail, title: "Contact Us", desc: "Email: support@lederblock.com | Phone: +14063165100" },
];

export default function TermsPage() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      {/* 🌌 Green Neon Particle Background */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute top-0 left-0 w-full h-full -z-10"
          options={{
            background: { color: { value: "#071b14" } },
            fpsLimit: 60,
            particles: {
              color: { value: "#39ff14" },
              links: { color: "#39ff14", distance: 150, enable: true, opacity: 0.3, width: 1 },
              move: { enable: true, speed: 1.2 },
              number: { value: 480, density: { enable: true } },
              opacity: { value: 0.4 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
          }}
        />
      )}

      {/* Terms Card */}
      <motion.div
        className="relative bg-[#0a2619]/80 p-10 rounded-3xl w-full max-w-6xl shadow-[0_0_25px_#39ff14] border border-green-500 backdrop-blur-xl z-10 mt-10 mb-16"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-lg mb-6">
          Terms & Conditions
        </h2>
        <p className="text-center text-green-200/80 mb-12">Last Updated: 01/08/2025</p>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {terms.map((term, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="flex gap-4 items-start p-6 rounded-xl bg-[#103322]/60 border border-green-500/40 hover:bg-[#15432e]/70 hover:shadow-[0_0_30px_#39ff14] transition-all duration-300"
            >
              <term.icon className="w-8 h-8 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-green-300 mb-1">{term.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{term.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 text-center text-green-300 font-medium text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By creating an account, you confirm that you have read, understood, and agree to these terms.
        </motion.p>
      </motion.div>

      {/* Footer */}
      <footer className="text-green-300 text-center py-6 relative z-10">
        <p className="text-sm">© {new Date().getFullYear()} Lederblock. All rights reserved.</p>
      </footer>
    </div>
  );
}
