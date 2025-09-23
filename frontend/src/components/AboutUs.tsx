"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutContent() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/img1.jpg" // first slide image
          alt="About Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-green-900/80"></div> {/* dark green overlay */}
      </div>

      {/* Content Card */}
      <div className="relative bg-green-900/90 border-2 border-green-400 rounded-2xl shadow-[0_0_20px_rgba(0,255,128,0.7)] p-10 max-w-xl text-center space-y-6 text-green-100">
        <h1 className="text-4xl font-bold text-green-300 drop-shadow-lg">About Us</h1>
        <p className="text-green-100">
          We are a team of passionate developers and designers creating amazing digital experiences.
        </p>

        <h2 className="text-2xl font-semibold text-green-300 mt-4 drop-shadow-md">Our Mission</h2>
        <p className="text-green-100">
          To provide innovative solutions that help businesses thrive in the digital age. We combine cutting-edge technology with creative design to deliver exceptional results.
        </p>

        <h2 className="text-2xl font-semibold text-green-300 mt-4 drop-shadow-md">Our Values</h2>
        <ul className="list-disc list-inside text-green-100 space-y-1">
          <li>Innovation</li>
          <li>Quality</li>
          <li>Integrity</li>
          <li>Customer Success</li>
        </ul>

        {/* Optional Get Started Button */}
        <Link
          href="/get-started"
          className="mt-6 inline-block px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-3xl shadow-[0_0_15px_rgba(0,255,128,0.7)] transition-transform transform hover:scale-105"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
