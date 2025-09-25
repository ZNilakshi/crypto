"use client";

import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { FaQuestionCircle, FaGlobe, FaClock, FaHandshake, FaDollarSign, FaTools } from "react-icons/fa";

type FAQPopupProps = {
  onClose: () => void;
};

export default function FAQPopup({ onClose }: FAQPopupProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.12 },
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

  const faqs = [
    {
      q: "What services do you offer?",
      a: "We offer web design, development, mobile app creation, and digital marketing solutions.",
      icon: <FaGlobe className="text-emerald-300 w-5 h-5" />,
    },
    {
      q: "How long does a typical project take?",
      a: "Project timelines vary depending on complexity, but most of our websites are completed within 2–6 weeks.",
      icon: <FaClock className="text-emerald-300 w-5 h-5" />,
    },
    {
      q: "Do you provide ongoing support?",
      a: "Yes, we offer maintenance packages and ongoing support for all our clients.",
      icon: <FaHandshake className="text-emerald-300 w-5 h-5" />,
    },
    {
      q: "What are your pricing options?",
      a: "Flexible pricing based on project requirements. Contact us for a custom quote.",
      icon: <FaDollarSign className="text-emerald-300 w-5 h-5" />,
    },
    {
      q: "Can you work with existing websites?",
      a: "Absolutely! We can redesign, optimize, or add new features to existing websites.",
      icon: <FaTools className="text-emerald-300 w-5 h-5" />,
    },
  ];

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
          <FaQuestionCircle className="text-emerald-400 w-7 h-7" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-300 drop-shadow-lg">
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-h-[65vh] overflow-y-auto pr-2 space-y-5"
        >
          {faqs.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.03, rotate: i % 2 === 0 ? 1 : -1 }}
              className="bg-emerald-900/30 border border-emerald-500/30 
                         rounded-xl p-4 shadow-md hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] 
                         transition"
            >
              <div className="flex items-center gap-2 mb-1">
                {item.icon}
                <p className="font-semibold text-emerald-200">{item.q}</p>
              </div>
              <p className="text-emerald-100/90">{item.a}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
