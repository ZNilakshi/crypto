"use client";

import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/img3.jpg"
          alt="Contact Background"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-green-900/80"></div>
      </div>

      <div className="relative bg-green-900/90 border-2 border-green-400 rounded-2xl shadow-[0_0_20px_rgba(0,255,128,0.7)] p-10 max-w-2xl text-center space-y-6 text-green-100">
        <h1 className="text-4xl font-bold text-green-300 drop-shadow-lg">Contact Us</h1>
        <p className="text-green-100 text-lg">Get in touch with our team</p>

        <div className="text-left space-y-3 mt-4">
          <p><strong>📧 Email:</strong> support@modernsite.com</p>
          <p><strong>📞 Phone:</strong> 123456789</p>
          <p><strong>📍 Address:</strong> 123 Innovation St, Tech City, Digital Nation</p>
          <p>
            <strong>💬 Telegram:</strong>{" "}
            <Link
              href="#"
              className="text-green-200 hover:text-green-400 underline"
            >
              Join Our Telegram
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
