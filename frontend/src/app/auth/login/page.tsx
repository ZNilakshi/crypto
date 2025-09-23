"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { auth } from "../../firebase";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { FaFacebookF } from "react-icons/fa";
import Link from 'next/link';

import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

// Separate Form Component
const LoginForm = ({ 
  onLogin, 
  onGoogleLogin, 
  onForgotPassword,
  loading,
  alert
}: {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
  onForgotPassword: (identifier: string) => void;
  loading: boolean;
  alert: { type: "success" | "error" | "info" | "warning"; message: string } | null;
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(identifier, password);
  }, [onLogin, identifier, password]);

  const handleForgotPasswordClick = useCallback(() => {
    onForgotPassword(identifier);
  }, [onForgotPassword, identifier]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative bg-[#0f3d24]/90 p-8 rounded-3xl w-full max-w-md shadow-[0_0_25px_#39ff14] border border-green-500 backdrop-blur-lg z-10 neon-form"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        boxShadow: "0 0 5px rgb(98, 155, 88), 0 0 10px rgb(118, 175, 108), 0 0 15px rgb(85, 137, 75), 0 0 20px #0f3d24, 0 0 35px #39ff14, 0 0 40px #39ff14",
      }}
    >
      {/* 🌌 Multi-Galaxy Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        {/* Random Twinkling Stars */}
      </div>

      <h2 className="text-3xl font-bold text-green-400 text-center mb-2 neon-text">
        LEDERBLOCK
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Unlock the Future of AI in the Jungle of Innovation
      </p>

      {/* ✅ Alert Section */}
      {alert && (
        <Collapse in={true}>
          <Alert severity={alert.type} className="mb-4 rounded-lg">
            {alert.message}
          </Alert>
        </Collapse>
      )}

      {/* Email / Username */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email or Username
        </label>
        <input
          type="text"
          placeholder="Enter your email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 
           ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 rounded-xl bg-[#102a24] text-white placeholder-gray-400 
           ring-1 ring-green-700 focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200"
        />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full mt-5 py-3 rounded-3xl font-semibold text-black relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ 
          background: "linear-gradient(90deg, rgb(92, 132, 76), rgb(30, 255, 0), rgba(76, 173, 69, 0.84))",
        }}
      >
        <span className="relative z-10">{loading ? "Logging..." : "LOGIN"}</span>
        
        {/* Circular Snake Effect */}
        <motion.div
          className="absolute inset-0 rounded-lg overflow-hidden"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute w-32 h-1 bg-white/80"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "0% 0%",
              boxShadow: "0 0 10px 2px rgb(0, 255, 21), 0 0 20px 5px #ff5500"
            }}
            animate={{
              x: [-60, 60, 60, -60, -60],
              y: [-60, -60, 60, 60, -60],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Hover effect */}
        <motion.div 
          className="absolute inset-0 bg-yellow-400 opacity-0"
          whileHover={{ opacity: 0.2 }}
        />
      </motion.button>

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-600"></div>
        <span className="mx-2 text-gray-400">or continue with</span>
        <div className="flex-grow h-px bg-gray-600"></div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-green-400 transition disabled:opacity-50"
        >
          {/* Google logo */}
          <svg width="24" height="24" viewBox="0 0 533.5 544.3">
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.4H272v95.3h146.9c-6.3 33.7-25.2 62.2-53.6 81.4v67.6h86.7c50.6-46.6 79.5-115.1 79.5-193.9z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c72.5 0 133.4-24 177.9-65.1l-86.7-67.6c-24.1 16.2-55.1 25.7-91.2 25.7-70.1 0-129.6-47.3-150.8-111.1H31.1v69.9C75.7 488.1 168.5 544.3 272 544.3z"
            />
            <path
              fill="#FBBC05"
              d="M121.2 314.2c-5.7-16.7-8.9-34.5-8.9-52.7s3.2-36 8.9-52.7v-69.9H31.1c-18.2 36.4-28.6 77.2-28.6 122.6s10.4 86.2 28.6 122.6l90.1-69.9z"
            />
            <path
              fill="#EA4335"
              d="M272 107.7c37.8 0 71.5 13 98.1 38.4l73.5-73.5C405.4 25.4 344.5 0 272 0 168.5 0 75.7 56.2 31.1 142.2l90.1 69.9c21.2-63.8 80.7-111.1 150.8-111.1z"
            />
          </svg>
        </button>

        <button
          type="button"
          className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full shadow-lg hover:shadow-green-400 transition"
        >
          <FaFacebookF className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleForgotPasswordClick}
          className="text-yellow-400 hover:underline"
        >
          Forgot Password?
        </button>          
        <p className="text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-green-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.form>
  );
};

// Loading Component
const LoadingAnimation = ({ progressPercent }: { progressPercent: number }) => (
  <div className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 perspective-[800px]">
    {/* 3D Neon Cube */}
    <motion.div
      className="relative w-24 h-24"
      animate={{ 
        rotateX: 360, 
        rotateY: 360,
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        rotateX: { repeat: Infinity, duration: 4, ease: "linear" },
        rotateY: { repeat: Infinity, duration: 3, ease: "linear", delay: 0.2 },
        scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
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
      >
        <motion.div 
          className="absolute inset-0 bg-yellow-200/30"
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      
      {/* Progress Percentage */}
      <div className="absolute -top-6 text-yellow-400 font-bold text-sm" style={{ left: `${progressPercent}%` }}>
        {progressPercent}%
      </div>
    </div>
    
    <p className="mt-4 text-yellow-400 font-semibold text-lg drop-shadow-[0_0_10px_#ffaa00]">
      Redirecting...
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
          ease: "easeInOut"
        }}
        style={{
          boxShadow: "0 0 10px 2px #ffaa00"
        }}
      />
    ))}
  </div>
);

// Main Component
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const router = useRouter();
  const [init, setInit] = useState(false);
 
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Initialize tsparticles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // Update progress percentage
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 40); // 4 seconds total for 100%
      
      return () => clearInterval(interval);
    } else {
      setProgressPercent(0);
    }
  }, [loading]);

  // Email/Username + Password Login
  const handleLogin = useCallback(async (identifier: string, password: string) => {
    try {
      setLoading(true);
      let email = identifier;

      if (!identifier.includes("@")) {
        const res = await axios.post(`${API_URL}/auth/get-email`, {
          username: identifier,
        });
        email = res.data.email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Fetch user role from backend
      const roleRes = await axios.post(`${API_URL}/auth/get-role`, {
        uid: firebaseUser.uid,
      });
      const role = roleRes.data.role;

      setAlert({
        type: "success",
        message: " Login successful! Redirecting...",
      });
      setShowFireEffect(true); // 🔥 trigger fire animation
      

      setTimeout(() => {
        router.push(role === "crypto_admin" ? "/dashboard/crypto" : "/dashboard/user");
      }, 3500);
    } catch (err: unknown) {
      const error = err as FirebaseError | { message?: string };
          // ✅ Handle Axios (backend) errors
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setAlert({ type: "error", message: " User not found" });
        } else {
          setAlert({
            type: "error",
            message: " Server error: " + (err.response?.data?.message || "Unknown"),
          });
        }
      }

      // ✅ Handle Firebase (frontend) errors
      else if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/invalid-email":
            setAlert({ type: "error", message: " Invalid email format" });
            break;
          case "auth/user-not-found":
            setAlert({ type: "error", message: " No account found with this email" });
            break;
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setAlert({ type: "error", message: " Incorrect password" });
            break;
          case "auth/user-disabled":
            setAlert({ type: "error", message: " This account is disabled" });
            break;
          default:
            setAlert({
              type: "error",
              message: " Firebase error: " + err.message,
            });
        }
      }

      // ✅ Fallback
      else {
        setAlert({ type: "error", message: "Unknown error occurred" });
      }

      setLoading(false);
    }
  }, [API_URL, router]);

  // Google Login
  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      try {
        // First, try to get the user's role (existing user)
        const roleRes = await axios.post(`${API_URL}/auth/get-role`, {
          uid: firebaseUser.uid,
        });
        
        const role = roleRes.data.role;

        setAlert({
          type: "success",
          message: "✅ Google login successful! Redirecting...",
        });

        setTimeout(() => {
          router.push(role === "crypto_admin" ? "/dashboard/crypto" : "/dashboard/user");
        }, 2000);
      } catch (error) {
        // If user doesn't exist (404), register them first
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Auto-generate username from email
          const baseUsername = firebaseUser.email?.split('@')[0] || `user${Date.now()}`;
          let username = baseUsername;
          
          // Check if username is available, if not, add random numbers
          try {
            const checkRes = await axios.post(`${API_URL}/auth/check-username`, {
              username: baseUsername
            });
            
            if (!checkRes.data.available) {
              username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
            }
          } catch (err) {
            username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
          }

          // Register the new user
          await axios.post(`${API_URL}/auth/register`, {
            firebaseUid: firebaseUser.uid,
            fullName: firebaseUser.displayName || "Google User",
            username: username,
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber || "",
          });

          setAlert({
            type: "success",
            message: "✅ Account created successfully! Redirecting...",
          });

          // New users default to 'user' role
          setTimeout(() => {
            router.push("/dashboard/user");
          }, 2000);
        } else {
          throw error; // Re-throw other errors
        }
      }
    } catch (err) {
      setLoading(false);
      setAlert({
        type: "error",
        message: "❌ " + ((err as Error).message || "Unknown error during Google login"),
      });
    }
  }, [API_URL, router]);

  const handleForgotPassword = useCallback(async (identifier: string) => {
    if (!identifier) {
      setAlert({ type: "warning", message: " Please enter your email first" });
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, identifier);
      setAlert({
        type: "success",
        message: " Password reset email sent! Check your inbox.",
      });
    } catch (err: unknown) {
      const error = err as FirebaseError;
  
      if (error.code === "auth/invalid-email") {
        setAlert({ type: "error", message: " Invalid email format" });
      } else if (error.code === "auth/user-not-found") {
        setAlert({ type: "error", message: " No user found with this email" });
      } else {
        setAlert({
          type: "error",
          message: " Error: " + (error.message || "Something went wrong"),
        });
      }
    }
  }, []);
  
  return (
    <div className="relative flex justify-center items-center min-h-screen text-white overflow-hidden">
      {/* Background Particles */}
      {init && (
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
      )}

      {/* Lightning Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-green-900 opacity-40"
            initial={{ 
              height: 0, 
              left: `${10 + i*20}%`,
              top: "-10%",
              opacity: 0
            }}
            animate={{ 
              height: ["0%", "120%", "0%"],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 2,
              delay: i * 0.7,
              ease: "easeOut"
            }}
            style={{ 
              filter: "blur(1px)",
              boxShadow: "0 0 20px 2px rgb(0, 255, 0)"
            }}
          />
        ))}
      </div>

      {/* Fire Effect */}
      {showFireEffect && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-orange-500"
              initial={{ 
                bottom: "0%", 
                left: `${Math.random() * 100}%`,
                opacity: 1,
                scale: 1
              }}
              animate={{ 
                bottom: "100%",
                opacity: 0,
                scale: 0,
                x: Math.random() > 0.5 ? Math.random() * 50 : Math.random() * -50
              }}
              transition={{
                duration: 1.5 + Math.random(),
                ease: "easeOut"
              }}
              style={{ 
                filter: "blur(1px)",
                boxShadow: "0 0 20px 5px #ff5500"
              }}
            />
          ))}
        </div>
      )}

      {/* Conditional Rendering without AnimatePresence */}
      {loading ? (
        <LoadingAnimation progressPercent={progressPercent} />
      ) : (
        <LoginForm 
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onForgotPassword={handleForgotPassword}
          loading={loading}
          alert={alert}
        />
      )}
    </div>
  );
}