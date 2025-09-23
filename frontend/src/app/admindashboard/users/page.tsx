"use client";

import { useEffect, useState, useCallback } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase";
import {
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Referral {
  username?: string;
  layer: number;
  level?: number;
  wallet?: number;
  directRefs?: number;
  joined?: string;
  referrer?: string;
}

interface User {
  _id: string;
  username?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  referralCode?: string;
  level?: number;
  createdAt?: string;

  walletBalance?: number;
  totalStakes?: number;
  totalTrading?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;

  referrals?: Referral[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [filterKey, setFilterKey] = useState<keyof User | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  
  async function api(path: string, init?: RequestInit) {
    const token = auth.currentUser ? await getIdToken(auth.currentUser, true) : "";
    return fetch(process.env.NEXT_PUBLIC_API_BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api("/admin/users");
      setUsers(res.items || []);
      setFilteredUsers(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserDetails = useCallback(async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const res = await api(`/admin/users/${userId}`);
      console.log("User details API response:", res);

      const flatReferrals: Referral[] = res.referrals
        ? res.referrals.flatMap(
            (layer: { layer: number; users: Referral[] }) =>
              layer.users.map((u) => ({
                ...u,
                layer: layer.layer,
              }))
          )
        : [];

      setUserDetails({
        ...res.user,
        referrals: flatReferrals,
      });
    } catch (err) {
      console.error("Error loading user details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedUser) {
      loadUserDetails(selectedUser._id);
    }
  }, [selectedUser, loadUserDetails]);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
    }
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key!] ?? "";
        const bVal = b[sortConfig.key!] ?? "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredUsers(result);
  }, [searchTerm, sortConfig, users]);

  const filtered = users.filter((user) => {
    if (!filterKey) return true;
    const value = user[filterKey];
    return value
      ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      : false;
  });
  
  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof User) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen text-black rounded-3xl bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor balances, stakes, and referral activity with ease.
          </p>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            {
              title: "Total Users",
              value: users.length,
              icon: UsersIcon,
              colors: "from-sky-500 to-sky-600",
            },
            {
              title: "Wallet Balance",
              value: formatCurrency(
                users.reduce((s, u) => s + (u.walletBalance || 0), 0)
              ),
              icon: BanknotesIcon,
              colors: "from-emerald-500 to-emerald-600",
            },
            {
              title: "Total Staked",
              value: formatCurrency(
                users.reduce((s, u) => s + (u.totalStakes || 0), 0)
              ),
              icon: ChartBarIcon,
              colors: "from-purple-500 to-indigo-600",
            },
            {
              title: "Trading Volume",
              value: formatCurrency(
                users.reduce((s, u) => s + (u.totalTrading || 0), 0)
              ),
              icon: CurrencyDollarIcon,
              colors: "from-amber-500 to-orange-500",
            },
            {
              title: "Total Withdrawals",
              value: formatCurrency(
                users.reduce((s, u) => s + (u.totalWithdrawals || 0), 0)
              ),
              icon: CurrencyDollarIcon,
              colors: "from-rose-500 to-red-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-r ${stat.colors} text-white rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition`}
            >
              <div className="flex items-center gap-4">
                <stat.icon className="h-10 w-10 opacity-90" />
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:flex-1">
              <input
                type="text"
                placeholder="🔍 Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 px-4 shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <button
              onClick={loadUsers}
              className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-6 rounded-xl shadow transition"
            >
              Refresh
            </button>
          </div>
        </section>

        {/* Users Table */}
        <section className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    {[
                      "username",
                      "walletBalance",
                      "totalStakes",
                      "totalTrading",
                      "totalDeposits",
                      "totalWithdrawals",
                    ].map((key, i) => (
                      <th
                        key={i}
                        className="py-3 px-5 font-semibold cursor-pointer"
                        onClick={() => handleSort(key as keyof User)}
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                        {getSortIndicator(key as keyof User)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-4 px-5">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.username || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-green-600 font-semibold">
                        {formatCurrency(user.walletBalance || 0)}
                      </td>
                      <td className="py-4 px-5 text-purple-600">
                        {formatCurrency(user.totalStakes || 0)}
                      </td>
                      <td className="py-4 px-5 text-amber-600">
                        {formatCurrency(user.totalTrading || 0)}
                      </td>
                      <td className="py-4 px-5 text-sky-600">
                        +{formatCurrency(user.totalDeposits || 0)}
                      </td>
                      <td className="py-4 px-5 text-rose-600">
                        -{formatCurrency(user.totalWithdrawals || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
              </div>
            ) : userDetails ? (
              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Username:</span> {userDetails.username || "N/A"}</p>
                      <p><span className="font-medium">Email:</span> {userDetails.email || "N/A"}</p>
                      <p><span className="font-medium">Full Name:</span> {userDetails.fullName || "N/A"}</p>
                      <p><span className="font-medium">Phone:</span> {userDetails.phoneNumber || "N/A"}</p>
                      <p><span className="font-medium">Referral Code:</span> {userDetails.referralCode || "N/A"}</p>
                      <p><span className="font-medium">Level:</span> {userDetails.level || 0}</p>
                      <p><span className="font-medium">Joined:</span> {formatDate(userDetails.createdAt)}</p>
                    </div>
                  </div>

                  {/* Finance */}
                  <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600"><span className="font-medium text-gray-900">Wallet:</span> {formatCurrency(userDetails.walletBalance || 0)}</p>
                      <p className="text-purple-600"><span className="font-medium text-gray-900">Staked:</span> {formatCurrency(userDetails.totalStakes || 0)}</p>
                      <p className="text-amber-600"><span className="font-medium text-gray-900">Trading:</span> {formatCurrency(userDetails.totalTrading || 0)}</p>
                      <p className="text-sky-600"><span className="font-medium text-gray-900">Deposits:</span> +{formatCurrency(userDetails.totalDeposits || 0)}</p>
                      <p className="text-rose-600"><span className="font-medium text-gray-900">Withdrawals:</span> -{formatCurrency(userDetails.totalWithdrawals || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Referrals */}
                <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Referral Details</h3>
                  {userDetails.referrals && userDetails.referrals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                          <tr>
                            <th className="py-3 px-4">Username</th>
                            <th className="py-3 px-4">Layer</th>
                            <th className="py-3 px-4">Level</th>
                            <th className="py-3 px-4">Wallet</th>
                            <th className="py-3 px-4">Direct Refs</th>
                            <th className="py-3 px-4">Joined</th>
                            <th className="py-3 px-4">Referred By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {userDetails.referrals.map((ref, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition">
                              <td className="py-3 px-4">{ref.username || "N/A"}</td>
                              <td className="py-3 px-4">{ref.layer}</td>
                              <td className="py-3 px-4">{ref.level || 0}</td>
                              <td className="py-3 px-4 text-green-600 font-semibold">
                                {formatCurrency(ref.wallet || 0)}
                              </td>
                              <td className="py-3 px-4">{ref.directRefs || 0}</td>
                              <td className="py-3 px-4">{formatDate(ref.joined)}</td>
                              <td className="py-3 px-4">{ref.referrer || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No referrals found for this user.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">Failed to load user details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
