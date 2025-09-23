"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "crypto_admin" | "user";
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login");
        return;
      }

      try {
        const token = await getIdToken(firebaseUser, true);

        // ✅ Use API_URL
        const res = await axios.post(`${API_URL}/auth/verify-email`, {
          idToken: token,
        });

        if (res.data.user.role !== "crypto_admin") {
          router.push("/auth/login");
          return;
        }

        setUser(res.data.user);

        // ✅ Fetch maintenance status
        const statusRes = await axios.get(`${API_URL}/system/status`);
        setMaintenance(statusRes.data.maintenanceMode);
      } catch (err) {
        console.error("❌ Auth error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, API_URL]);

  // ✅ Toggle Maintenance Mode
  const toggleMaintenance = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const token = await getIdToken(firebaseUser, true);

      const res = await axios.post(
        `${API_URL}/system/toggle-maintenance`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMaintenance(res.data.maintenanceMode);
    } catch (err) {
      console.error("❌ Toggle maintenance error:", err);
    }
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="font-sans text-white min-h-screen p-6 bg-gradient-to-br from-green-700 via-emerald-900 to-lime-900">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <button
        onClick={toggleMaintenance}
        className={`px-6 py-3 rounded font-semibold text-white ${
          maintenance ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {maintenance ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
      </button>

      <div className="mt-6">
        <p>Current Status: {maintenance ? "🚧 Under Maintenance" : "✅ Live"}</p>
      </div>
    </div>
  );
}
