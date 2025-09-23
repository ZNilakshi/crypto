"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

// Use the correct base URL that includes /api
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Add /api to the path since your backend routes are under /api
        const statusRes = await axios.get(`${API_BASE}/api/system/status`);
        setMaintenance(statusRes.data.maintenanceMode);

        const user = auth.currentUser;
        if (user) {
          const token = await getIdToken(user);
          const roleRes = await axios.post(
            `${API_BASE}/api/auth/get-role`,
            { uid: user.uid },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsAdmin(roleRes.data.role === "crypto_admin");
        }
      } catch (err) {
        console.error("Error fetching system status:", err);
        // Set loading to false even on error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (maintenance && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white text-center p-6">
        <h1 className="text-4xl font-bold mb-4">🚧 Website Under Development</h1>
        <p className="text-lg opacity-80 mb-6">
          Our site is currently undergoing scheduled maintenance.<br />
          Please check back later.
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return <>{children}</>;
}