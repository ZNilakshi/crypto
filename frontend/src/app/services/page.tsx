"use client";

import Image from "next/image";

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Optional Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/img2.avif" // you can choose any background
          alt="Services Background"
          
          className="object-cover"
        />
        <div className="absolute inset-0 bg-green-900/80"></div>
      </div>

      <div className="relative bg-green-900/90 border-2 border-green-400 rounded-2xl shadow-[0_0_20px_rgba(0,255,128,0.7)] p-10 max-w-4xl text-center space-y-8 text-green-100">
        <h1 className="text-4xl font-bold text-green-300 drop-shadow-lg">Our Services</h1>
        <p className="text-green-100 text-lg">
          Comprehensive solutions for all your digital needs
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-green-800/70 p-4 rounded-xl shadow-[0_0_10px_rgba(0,255,128,0.5)]">
            <h2 className="text-2xl font-semibold text-green-300">🎨 Web Design</h2>
            <p className="text-green-100 mt-2">
              Beautiful, responsive websites that convert visitors into customers.
            </p>
          </div>

          <div className="bg-green-800/70 p-4 rounded-xl shadow-[0_0_10px_rgba(0,255,128,0.5)]">
            <h2 className="text-2xl font-semibold text-green-300">⚡ Development</h2>
            <p className="text-green-100 mt-2">
              Fast, secure, and scalable web applications for businesses of all sizes.
            </p>
          </div>

          <div className="bg-green-800/70 p-4 rounded-xl shadow-[0_0_10px_rgba(0,255,128,0.5)]">
            <h2 className="text-2xl font-semibold text-green-300">📱 Mobile Apps</h2>
            <p className="text-green-100 mt-2">
              Native and hybrid mobile applications for iOS and Android platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
