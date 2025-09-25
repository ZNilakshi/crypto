"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Rocket, User, Wrench, Phone } from "lucide-react";
import type { Variants } from "framer-motion";

type HelpPopupProps = {
  onClose: () => void;
};

export default function HelpPopup({ onClose }: HelpPopupProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15 },
    },
  };

  

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 70 },
    },
  };
  

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800
                   border border-emerald-500/40 rounded-2xl p-6 max-w-xl w-full 
                   text-white shadow-[0_0_35px_rgba(16,185,129,0.5)] overflow-hidden"
        tabIndex={0}
      >
        {/* Glow Orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-400/20 rounded-full blur-[90px] animate-pulse"></div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 text-emerald-300 hover:text-emerald-100 
                     text-2xl transition-transform"
        >
          ✕
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <LifeBuoy className="w-7 h-7 text-emerald-400" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-300 drop-shadow-lg">
            Help Center
          </h2>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-h-[65vh] overflow-y-auto pr-2 space-y-6"
        >
          {/* Getting Started */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 shadow-md 
                       hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-emerald-200">Getting Started</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-emerald-100/90">
              <li>Create your account by clicking the Login button</li>
              <li>Explore our services through the navigation menu</li>
              <li>Contact our support team for personalized assistance</li>
            </ul>
          </motion.div>

          {/* Account Management */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, rotate: -1 }}
            className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 shadow-md 
                       hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-emerald-200">Account Management</h3>
            </div>
            <p className="text-emerald-100/90">
              Manage your account settings, preferences, and billing information through your dashboard.
            </p>
          </motion.div>

          {/* Technical Support */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 shadow-md 
                       hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-emerald-200">Technical Support</h3>
            </div>
            <p className="text-emerald-100/90">
              If you encounter any technical issues, our team is available 24/7 to assist you.
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, rotate: -1 }}
            className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 shadow-md 
                       hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-semibold text-emerald-200">Contact Information</h3>
            </div>
            <ul className="space-y-1 text-emerald-100/90">
              <li>Email: support@modernsite.com</li>
              <li>Phone: +1 (123) 456-7890</li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
