"use client";

import { useEffect } from "react";

type HelpPopupProps = {
  onClose: () => void;
};

export default function HelpPopup({ onClose }: HelpPopupProps) {
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

        <h2 className="text-3xl font-extrabold mb-4 text-green-300 drop-shadow-lg">Help Center</h2>

        <h3 className="text-xl font-semibold text-green-200 mt-4">Getting Started</h3>
        <ul className="list-inside mt-2 space-y-2">
          <li className="text-green-100 text-base before:content-['•'] before:text-green-400 before:mr-2">
            Create your account by clicking the Login button
          </li>
          <li className="text-green-100 text-base before:content-['•'] before:text-green-400 before:mr-2">
            Explore our services through the navigation menu
          </li>
          <li className="text-green-100 text-base before:content-['•'] before:text-green-400 before:mr-2">
            Contact our support team for personalized assistance
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-green-200 mt-4">Account Management</h3>
        <p className="text-green-100 text-base">Manage your account settings, preferences, and billing information through your dashboard.</p>

        <h3 className="text-xl font-semibold text-green-200 mt-4">Technical Support</h3>
        <p className="text-green-100 text-base">If you encounter any technical issues, our team is available 24/7 to assist you.</p>

        <h3 className="text-xl font-semibold text-green-200 mt-4">Contact Information</h3>
        <ul className="list-inside space-y-1 text-green-100 text-base">
          <li>Email: support@modernsite.com</li>
          <li>Contact Us: +1 (123) 456-7890</li>
        </ul>
      </div>
    </div>
  );
}
