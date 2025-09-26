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
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { useState } from "react";

export default function ConnectContent() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 },
    }),
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-950">
      {/* Background glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-green-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-10 right-1/2 translate-x-1/2 w-[22rem] h-[22rem] bg-cyan-500/20 rounded-full blur-[100px]"></div>

      <div className="relative z-10 container mx-auto px-6 py-20 space-y-24">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-cyan-300 to-green-400 animate-text">
            Connect With Us
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Reach out and let’s build the <span className="text-green-300 font-semibold">future</span> together.
          </p>
        </motion.div>

       {/* Contact Hub */}
{/* Contact Hub */}
<motion.div
  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6"
  initial="hidden"
  animate="visible"
>
  {[
    {
      icon: <FiMail />,
      label: "Email",
      value: (
        <a
          href="mailto:support@modernsite.com"
          className="hover:underline break-all"
        >
          support@modernsite.com
        </a>
      ),
    },
    {
      icon: <FiPhone />,
      label: "Phone",
      value: (
        <a href="tel:+1234567890" className="hover:underline">
          +1 (234) 567-890
        </a>
      ),
    },
    { icon: <FiMapPin />, label: "Address", value: "123 Innovation St" },
    {
      icon: <FiSend />,
      label: "Telegram",
      value: (
        <a
          href="https://t.me/YourTelegramGroup"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
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
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34,197,94,0.3)" }}
      className="flex items-center gap-4 p-5 rounded-2xl 
                 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/10 
                 border border-green-400/20 shadow-lg transition-all duration-300"
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-full 
                      bg-gradient-to-tr from-green-400/40 to-cyan-400/40 
                      text-green-200 text-2xl shadow-md">
        {item.icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide">
          {item.label}
        </h3>
        <p className="text-green-100 font-medium text-sm">{item.value}</p>
      </div>
    </motion.div>
  ))}
</motion.div>

        {/* FAQ */}
        <motion.div className="max-w-2xl mx-auto" initial="hidden" animate="visible">
          <h2 className="text-3xl font-bold text-green-300 mb-8 text-center">
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
              <div
                key={i}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 border border-green-400/20 hover:border-green-400/40 transition-all"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex justify-between items-center text-left text-green-200 font-semibold"
                >
                  {faq.q}
                  {openIndex === i ? <FiMinus className="text-green-400" /> : <FiPlus className="text-green-400" />}
                </button>
                {openIndex === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-green-100 mt-3 text-sm leading-relaxed"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <div className="flex justify-center gap-6">
          {[
            { icon: <FiTwitter />, href: "#", label: "Twitter" },
            { icon: <FiFacebook />, href: "#", label: "Facebook" },
            { icon: <FiLinkedin />, href: "#", label: "LinkedIn" },
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              whileHover={{ scale: 1.15 }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400/20 to-cyan-400/20 
                         text-green-200 text-xl shadow-md shadow-green-500/20 hover:from-green-400/40 hover:to-cyan-400/30 
                         transition-all duration-300"
              title={social.label}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
