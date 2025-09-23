"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

type FAQPopupProps = {
  onClose: () => void;
};

export default function FAQPopup({ onClose }: FAQPopupProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-green-900/90 to-green-800/80 
                   border border-green-400/40 rounded-2xl p-6 max-w-xl w-full 
                   text-white shadow-[0_0_30px_rgba(0,255,128,0.5)] 
                   focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        tabIndex={0}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-green-300 hover:text-green-100 
                     text-2xl transition-transform hover:scale-110"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-3xl font-extrabold mb-4 text-green-300 drop-shadow-lg text-center">
          ❓ Frequently Asked Questions
        </h2>

        {/* FAQ List */}
        <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
          <div>
            <p className="font-semibold text-green-200"> What services do you offer?</p>
            <p className="text-green-100/90">We offer web design, development, mobile app creation, and digital marketing solutions.</p>
          </div>
          <div>
            <p className="font-semibold text-green-200">How long does a typical project take?</p>
            <p className="text-green-100/90">Project timelines vary depending on complexity, but most of our websites are completed within 2-6 weeks.</p>
          </div>
          <div>
            <p className="font-semibold text-green-200">👉 Do you provide ongoing support?</p>
            <p className="text-green-100/90">Yes, we offer maintenance packages and ongoing support for all our clients.</p>
          </div>
          <div>
            <p className="font-semibold text-green-200">👉 What are your pricing options?</p>
            <p className="text-green-100/90">Flexible pricing based on project requirements. Contact us for a custom quote.</p>
          </div>
          <div>
            <p className="font-semibold text-green-200">👉 Can you work with existing websites?</p>
            <p className="text-green-100/90">Absolutely! We can redesign, optimize, or add new features to existing websites.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
