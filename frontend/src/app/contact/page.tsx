"use client";

import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
} from "react-icons/fi";

export default function ConnectContent() {
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
      {/* Background Shapes */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-green-600 rounded-full mix-blend-screen opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 -right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen opacity-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500 rounded-lg rotate-45 opacity-10"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-cyan-300 text-glow">
            Connect
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Get in touch with our team and let&apos;s build the future together.
          </p>
        </motion.div>

        {/* Contact Info Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: <FiMail />, label: "Email", value: "support@modernsite.com" },
            { icon: <FiPhone />, label: "Phone", value: "123456789" },
            { icon: <FiMapPin />, label: "Address", value: "123 Innovation St, Tech City" },
            {
              icon: <FiSend />,
              label: "Telegram",
              value: (
                <a
                  href="https://t.me/YourTelegramGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-300 transition"
                >
                  Join Us
                </a>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="bg-gray-800/40 p-6 rounded-2xl border border-green-400/20 hover:border-green-400/40 transition-all shadow-lg shadow-green-500/10 backdrop-blur-sm text-center"
            >
              <div className="text-4xl text-green-400 mb-3 mx-auto">{item.icon}</div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">
                {item.label}
              </h3>
              <p className="text-green-100">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

      
        {/* FAQ Section */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-green-300 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How can I join your Telegram group?",
                a: "Simply click the Telegram link above and you’ll be redirected to our community.",
              },
              {
                q: "Do you offer customer support?",
                a: "Yes, our support team is available 24/7 via email and Telegram.",
              },
              {
                q: "Where are you located?",
                a: "Our headquarters are based in Tech City, but we serve clients globally.",
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                custom={i}
                variants={fadeUp}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-green-400/20"
              >
                <summary className="cursor-pointer text-green-200 font-semibold">
                  {faq.q}
                </summary>
                <p className="text-green-100 mt-2">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-12">
          <a href="#" className="text-green-300 hover:text-green-100 text-2xl">
            <FiTwitter />
          </a>
          <a href="#" className="text-green-300 hover:text-green-100 text-2xl">
            <FiFacebook />
          </a>
          <a href="#" className="text-green-300 hover:text-green-100 text-2xl">
            <FiLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
}
