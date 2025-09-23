"use client";

import { useEffect } from "react";

type FAQPopupProps = {
  onClose: () => void;
};

export default function FAQPopup({ onClose }: FAQPopupProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative bg-green-900 border-2 border-green-400 rounded-xl p-6 max-w-lg w-full text-white
                      shadow-[0_0_20px_rgba(0,255,128,0.7)] animate-slideIn
                      focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black"
          tabIndex={0}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-green-400 hover:text-green-200 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-green-300 drop-shadow-lg">Frequently Asked Questions</h2>

        <ul className="list-disc list-inside space-y-2 text-green-100">
          <li><strong>What services do you offer?</strong> We offer web design, development, mobile app creation, and digital marketing solutions.</li>
          <li><strong>How long does a typical project take?</strong> Project timelines vary depending on complexity, but most of our websites are completed within 2-6 weeks.</li>
          <li><strong>Do you provide ongoing support?</strong> Yes, we offer maintenance packages and ongoing support for all our clients.</li>
          <li><strong>What are your pricing options?</strong> Flexible pricing based on project requirements. Contact us for a custom quote.</li>
          <li><strong>Can you work with existing websites?</strong> Absolutely! We can redesign, optimize, or add new features to existing websites.</li>
        </ul>
      </div>
    </div>
  );
}
