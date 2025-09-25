"use client";

import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-950">
      {/* Background accents */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-green-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-1/2 translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-16 space-y-20">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl mt-6 sm:text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-cyan-300">
            Connect With Us
          </h1>
          <p className="text-base sm:text-lg text-green-100 max-w-xl mx-auto leading-relaxed">
            Reach out and let’s build the future together.
          </p>
        </motion.div>

        {/* Contact Hub Section */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center"
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: <FiMail />, label: "Email", value: "support@modernsite.com" },
            { icon: <FiPhone />, label: "Phone", value: "+1 (234) 567-890" },
            { icon: <FiMapPin />, label: "Address", value: "123 Innovation St" },
            {
              icon: <FiSend />,
              label: "Telegram",
              value: (
                <a
                  href="https://t.me/YourTelegramGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-300 transition"
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-4"
            >
              {/* Icon Circle */}
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full 
                              bg-gradient-to-tr from-green-400/30 to-cyan-400/30 
                              text-green-200 text-3xl shadow-xl shadow-green-500/20 
                              hover:from-green-400/50 hover:to-cyan-400/40 
                              transition-all duration-300">
                {item.icon}
                <span className="absolute inset-0 rounded-full animate-pulse bg-green-400/10"></span>
              </div>

              {/* Label + Value */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-green-300 uppercase tracking-wide">
                  {item.label}
                </h3>
                <p className="text-green-100 font-semibold text-sm sm:text-base">
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-green-300 mb-8 text-center">
            FAQs
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How can I join your Telegram group?",
                a: "Click the Telegram link above to join our community instantly.",
              },
              {
                q: "Do you offer customer support?",
                a: "Yes, our team is available 24/7 via email and Telegram.",
              },
              {
                q: "Where are you located?",
                a: "We are based in Tech City but serve clients worldwide.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 border border-green-400/20 hover:border-green-400/40 transition-all"
              >
                <summary className="cursor-pointer text-green-200 font-semibold flex justify-between items-center">
                  {faq.q}
                  <span className="ml-2 text-green-400">+</span>
                </summary>
                <p className="text-green-100 mt-3 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <div className="flex justify-center flex-wrap gap-6">
          {[
            { icon: <FiTwitter />, href: "#", label: "Twitter" },
            { icon: <FiFacebook />, href: "#", label: "Facebook" },
            { icon: <FiLinkedin />, href: "#", label: "LinkedIn" },
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400/20 to-cyan-400/20 
                         text-green-200 flex items-center gap-2 text-sm font-medium 
                         shadow-md shadow-green-500/20 hover:from-green-400/40 hover:to-cyan-400/30 
                         transition-all duration-300"
            >
              {social.icon} {social.label}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
