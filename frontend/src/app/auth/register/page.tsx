"use client";
import { useEffect, useState, memo } from "react";
import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Link from "next/link";

// Memoized Lightning Effect
const LightningEffect = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 bg-green-900 opacity-40"
        initial={{ height: 0, left: `${10 + i * 20}%`, top: "-10%", opacity: 0 }}
        animate={{ height: ["0%", "120%", "0%"], opacity: [0, 0.4, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: Math.random() * 5 + 2,
          delay: i * 0.7,
          ease: "easeOut",
        }}
        style={{
          filter: "blur(1px)",
          boxShadow: "0 0 20px 2px rgb(0, 255, 0)",
        }}
      />
    ))}
  </div>
));

// Memoized Fire Effect
const FireEffect = memo(() => (
  <div className="absolute inset-0 pointer-events-none z-20">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full bg-orange-500"
        initial={{
          bottom: "0%",
          left: `${Math.random() * 100}%`,
          opacity: 1,
          scale: 1,
        }}
        animate={{
          bottom: "100%",
          opacity: 0,
          scale: 0,
          x: Math.random() > 0.5 ? Math.random() * 50 : Math.random() * -50,
        }}
        transition={{
          duration: 1.5 + Math.random(),
          ease: "easeOut",
        }}
        style={{
          filter: "blur(1px)",
          boxShadow: "0 0 20px 5px #ff5500",
        }}
      />
    ))}
  </div>
));

// Memoized Particles Component
const ParticlesBackground = memo(({ init }: { init: boolean }) => {
  if (!init) return null;
  return (
    <Particles
      id="tsparticles"
      className="absolute top-0 left-0 w-full h-full -z-10"
      options={{
        background: { color: { value: "#0a2a1f" } },
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" } },
          modes: { repulse: { distance: 120 } },
        },
        particles: {
          color: { value: "#00ff99" },
          links: {
            color: "#00ff99",
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          move: { enable: true, speed: 1 },
          number: { value: 780, density: { enable: true } },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
});

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const referralFromLink = searchParams.get("ref");

  // Individual state variables for form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState(referralFromLink || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({
    score: 0,
    label: "Too Weak",
    color: "bg-red-500",
  });
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load Particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    if (referralFromLink) {
      setReferralCode(referralFromLink);
    }
  }, [referralFromLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "fullName") setFullName(value);
    if (name === "username") {
      setUsername(value);
      checkUsername(value);
    }
    if (name === "email") setEmail(value);
    if (name === "referralCode") setReferralCode(value);
    if (name === "password") {
      setPassword(value);
      evaluatePassword(value);
    }
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  // Check unique username
  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/auth/check-username`, { username });
      setUsernameAvailable(res.data.available);
    } catch (err) {
      console.error(err);
      setUsernameAvailable(null);
    }
  };

  // Password strength check
  const evaluatePassword = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      setPasswordStrength({ score, label: "Too Weak", color: "bg-red-500" });
    } else if (score === 2) {
      setPasswordStrength({ score, label: "Weak", color: "bg-orange-500" });
    } else if (score === 3) {
      setPasswordStrength({ score, label: "Medium", color: "bg-yellow-500" });
    } else {
      setPasswordStrength({ score, label: "Strong", color: "bg-green-500" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match!" });
      return;
    }

    if (passwordStrength.score < 3) {
      setAlert({ type: "warning", message: "Please choose a stronger password." });
      return;
    }

    if (usernameAvailable === false) {
      setAlert({ type: "error", message: "Username already taken." });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verified`,
        handleCodeInApp: true,
      };

      await sendEmailVerification(userCredential.user, actionCodeSettings);

      await axios.post(`${API_URL}/auth/register`, {
        fullName,
        username,
        email,
        phoneNumber,
        referralCode,
        firebaseUid: userCredential.user.uid,
      });

      setAlert({
        type: "success",
        message: "Registered successfully! Please verify your email.",
      });

      setShowFireEffect(true);
      setTimeout(() => setShowFireEffect(false), 3000);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "code" in err) {
        const firebaseError = err as { code: string };

        if (firebaseError.code === "auth/email-already-in-use") {
          setAlert({
            type: "error",
            message: "This email is already registered. Please log in.",
          });
        } else if (firebaseError.code === "auth/invalid-email") {
          setAlert({ type: "error", message: "Invalid email format." });
        } else if (firebaseError.code === "auth/weak-password") {
          setAlert({ type: "error", message: "Password is too weak." });
        } else {
          setAlert({
            type: "error",
            message: "Firebase error occurred. Please try again.",
          });
        }
      } else if (axios.isAxiosError(err) && err.response) {
        setAlert({ type: "error", message: err.response.data.message });
      } else {
        setAlert({
          type: "error",
          message: "Registration failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Debugging re-renders
  useEffect(() => {
    console.log("RegisterPage re-rendered");
  });

  return (
    <div className="relative flex justify-center items-center min-h-screen text-white overflow-hidden">
      {/* Background Particles */}
      <ParticlesBackground init={init} />

      {/* Lightning Effect */}
      <LightningEffect />

      {/* Fire Effect */}
      {showFireEffect && <FireEffect />}

      {/* Form Wrapper with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <form
          onSubmit={handleRegister}
          className="relative bg-[#0f3d24]/90 p-8 rounded-3xl w-full max-w-lg shadow-[0_0_25px_#39ff14] border border-green-500 backdrop-blur-lg"
        >
          <h1 className="text-3xl font-extrabold text-center text-green-400 drop-shadow-[0_0_20px_#00ff99] mb-2">
            LEDERBLOCK
          </h1>
          <p className="text-center text-gray-300 mb-8 text-sm sm:text-base">
            Unlock the Future of AI in the Jungle of Innovation
          </p>

          {/* Alert Messages */}
          {alert && (
            <Collapse in={true}>
              <Alert severity={alert.type} className="mb-4 rounded-lg">
                {alert.message}
              </Alert>
            </Collapse>
          )}

          {/* Username */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Username</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />
              {usernameAvailable !== null && (
                <span
                  className={`flex items-center gap-1 text-xs mt-1 font-medium ${
                    usernameAvailable ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {usernameAvailable ? (
                    <>
                      <span className="text-green-400">✔</span> Username available
                    </>
                  ) : (
                    <>
                      <span className="text-red-400">✖</span> Username already in use
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col mt-3 sm:mt-4">
            <label className="mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Phone + Referral */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Phone Number</label>
              <PhoneInput
                country={"lk"}
                value={phoneNumber}
                onChange={setPhoneNumber}
                inputClass="!w-full !h-[42px] !p-2 !pl-14 !rounded-xl !bg-[#102a24] !text-white !placeholder-gray-400 !ring-1 !ring-green-700 focus:!ring-2 focus:!ring-green-500 !outline-none"
                buttonClass="!bg-[#102a24] !border-none"
                containerClass="!w-full !rounded-3xl"
                dropdownClass="!bg-[#102a24] !text-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Referral Code</label>
              <input
                type="text"
                name="referralCode"
                value={referralCode}
                onChange={handleChange}
                placeholder="Enter referral code (optional)"
                className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />

              {/* Password Strength Bar */}
              {password && (
                <div className="mt-2">
                  <div className="w-full h-2 rounded bg-gray-700">
                    <div
                      className={`h-2 rounded ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-300">{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-300">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-center mt-5 text-gray-300 text-sm">
            <input type="checkbox" required className="mr-2 accent-green-500" />
            I agree to the{" "}
            <a
              href="/terms_conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 ml-1 hover:underline hover:text-green-300 transition"
            >
              Terms & Privacy Policy
            </a>
          </label>

          {/* Sign Up Button with Circular Snake Effect */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-3 rounded-3xl font-semibold text-black relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background:
                "linear-gradient(90deg,rgb(92, 132, 76),rgb(30, 255, 0),rgba(76, 173, 69, 0.84))",
            }}
          >
            <span className="relative z-10">{loading ? "Registering..." : "SIGN UP"}</span>

            {/* Circular Snake Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg overflow-hidden"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="absolute w-32 h-1 bg-white/80"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: "0% 0%",
                  boxShadow: "0 0 10px 2px rgb(0, 255, 21), 0 0 20px 5px #ff5500",
                }}
                animate={{
                  x: [-60, 60, 60, -60, -60],
                  y: [-60, -60, 60, 60, -60],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Hover effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-400 opacity-0"
              whileHover={{ opacity: 0.2 }}
            />
          </motion.button>

          {/* Footer */}
          <p className="text-center text-sm mt-4 text-gray-300">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-green-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </motion.div>

      {/* Neon Rotating Cube Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 perspective-[800px]">
          {/* 3D Neon Cube */}
          <motion.div
            className="relative w-24 h-24"
            animate={{
              rotateX: 360,
              rotateY: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotateX: { repeat: Infinity, duration: 4, ease: "linear" },
              rotateY: { repeat: Infinity, duration: 3, ease: "linear", delay: 0.2 },
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
            }}
          >
            {/* Cube faces */}
            {["front", "back", "left", "right", "top", "bottom"].map((face) => (
              <div
                key={face}
                className={`
                  absolute w-24 h-24 border-4 border-yellow-400 bg-[#3d2a0f]/40
                  shadow-[0_0_30px_#ffaa00] flex justify-center items-center
                `}
                style={{
                  transform:
                    face === "front"
                      ? "translateZ(48px)"
                      : face === "back"
                      ? "rotateY(180deg) translateZ(48px)"
                      : face === "right"
                      ? "rotateY(90deg) translateZ(48px)"
                      : face === "left"
                      ? "rotateY(-90deg) translateZ(48px)"
                      : face === "top"
                      ? "rotateX(90deg) translateZ(48px)"
                      : "rotateX(-90deg) translateZ(48px)",
                }}
              />
            ))}

            {/* Inner Glow */}
            <div className="absolute inset-0 bg-yellow-400/10 rounded-lg shadow-[inset_0_0_50px_#ffaa00] animate-pulse" />
          </motion.div>

          {/* Enhanced Progress Bar */}
          <div className="w-64 h-3 bg-yellow-900 rounded-full mt-6 overflow-hidden relative">
            <motion.div
              className="h-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full relative"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut" }}
              onUpdate={(latest) => {
                const width = parseInt((latest as { width: string }).width);
                setProgressPercent(width);
              }}
            >
              <motion.div
                className="absolute inset-0 bg-yellow-200/30"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Progress Percentage */}
            <div
              className="absolute -top-6 text-yellow-400 font-bold text-sm"
              style={{ left: `${progressPercent}%` }}
            >
              {progressPercent}%
            </div>
          </div>

          <p className="mt-4 text-yellow-400 font-semibold text-lg drop-shadow-[0_0_10px_#ffaa00]">
            Registering...
          </p>

          {/* Particles around loader */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i / 15) * Math.PI * 2) * 100,
                y: Math.sin((i / 15) * Math.PI * 2) * 100,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
              style={{
                boxShadow: "0 0 10px 2px #ffaa00",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}