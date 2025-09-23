"use client";

import { useEffect, useState, useCallback } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Copy,
  CheckCheck,
} from "lucide-react";

interface Deposit {
  _id: string;
  amount: number;
  txHash: string;
  walletType?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HOLD";
  reason?: string;
  createdAt: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  // Modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [modalAction, setModalAction] = useState<"reject" | "hold" | null>(null);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  // 🔹 API helper (no forced token refresh!)
  async function api(path: string, init?: RequestInit) {
    const token = auth.currentUser ? await getIdToken(auth.currentUser) : "";
    return fetch(process.env.NEXT_PUBLIC_API_BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  // 🔹 Stable loadDeposits
  const loadDeposits = useCallback(async () => {
    setIsLoading(true);
    try {
      const d = await api("/deposits/admin/all");
      setDeposits(d.items || []);
      setFilteredDeposits(d.items || []);
    } catch (error) {
      console.error("Error loading deposits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔹 Initial load (runs only once)
  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  // 🔹 Filtering
  useEffect(() => {
    let result = deposits;
    if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.user?.username?.toLowerCase().includes(term) ||
          d.user?.email?.toLowerCase().includes(term) ||
          d.txHash?.toLowerCase().includes(term)
      );
    }
    setFilteredDeposits(result);
  }, [statusFilter, searchTerm, deposits]);

  // 🔹 Handle approve/reject/hold
  function handleAction(id: string, action: "approve" | "reject" | "hold") {
    if (action === "approve") {
      processAction(id, action); // Approve immediately
    } else {
      setSelectedDepositId(id);
      setModalAction(action);
      setReasonInput("");
      setShowReasonModal(true);
    }
  }

  async function processAction(id: string, action: "approve" | "reject" | "hold", reason?: string) {
    setIsLoading(true);
    try {
      await api(`/deposits/admin/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      });
      loadDeposits();
    } catch (error) {
      console.error("Error processing action:", error);
      setIsLoading(false);
    }
  }

  // 🔹 Helpers
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "HOLD":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function truncateAddress(address: string, startChars: number = 6, endChars: number = 4) {
    if (!address) return "N/A";
    if (address.length <= startChars + endChars) return address;
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
  }

  const handleCopy = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 1500);
  };

  return (
    <div className="min-h-screen text-black rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-indigo-600" />
            USDT Deposit Management
          </h1>
          <p className="text-gray-500 mt-1">Review and manage user deposit requests</p>
        </div>

        {/* Stats Overview */}
        <div className="grid rounded-2xl text-white grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: "Total Deposits",
              value: deposits.length,
              color: "text-white",
              bg: "from-indigo-500 to-indigo-500",
              icon: Wallet,
            },
            {
              label: "Pending",
              value: deposits.filter((d) => d.status === "PENDING").length,
              color: "text-white",
              bg: "from-yellow-400 to-orange-400",
              icon: Clock,
            },
            {
              label: "Approved",
              value: deposits.filter((d) => d.status === "APPROVED").length,
              color: "text-white",
              bg: "from-green-400 to-emerald-500",
              icon: CheckCircle,
            },
            {
              label: "Rejected",
              value: deposits.filter((d) => d.status === "REJECTED").length,
              color: "text-white",
              bg: "from-red-400 to-pink-500",
              icon: XCircle,
            },
            {
              label: "Hold",
              value: deposits.filter((d) => d.status === "HOLD").length,
              color: "text-white",
              bg: "from-purple-400 to-purple-500",
              icon: Clock,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 shadow-md border border-gray-200 flex items-center gap-4`}
            >
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
                <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          className="bg-gradient-to-br from-gray-50 to-white text-black rounded-2xl p-6 shadow-sm border border-gray-200 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-end md:items-center">
            {/* Status Filter */}
            <div className="w-full md:w-56">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 px-4 text-sm bg-white shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="HOLD">Hold</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, email or tx hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm bg-white shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadDeposits}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No deposit requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "User",
                      "USDT Amount",
                      "Transaction Hash",
                      "Network",
                      "Status",
                      "Reason",
                      "Requested",
                      "Actions",
                    ].map((head, i) => (
                      <th
                        key={i}
                        className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeposits.map((d) => (
                    <motion.tr
                      key={d._id}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{d.user?.username || "N/A"}</div>
                          <div className="text-sm text-gray-500">{d.user?.email || "N/A"}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-indigo-700">{d.amount} USDT</td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-mono text-gray-700 flex items-center">
                          {truncateAddress(d.txHash)}
                          <button
                            onClick={() => handleCopy(d.txHash)}
                            className="ml-2 text-indigo-500 hover:text-indigo-700"
                          >
                            {copiedTx === d.txHash ? (
                              <CheckCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {d.walletType || "ERC20"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                            d.status
                          )}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{d.reason || "-"}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{formatDate(d.createdAt)}</td>
                      <td className="py-4 px-4">
                        {["PENDING", "HOLD"].includes(d.status) ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(d._id, "approve")}
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(d._id, "reject")}
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                            >
                              Reject
                            </button>
                            {d.status === "PENDING" && (
                              <button
                                onClick={() => handleAction(d._id, "hold")}
                                className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition"
                              >
                                Hold
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Processed</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reason Modal */}
      {showReasonModal && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {modalAction === "reject" ? "Reject Deposit" : "Put Deposit On Hold"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for this action.</p>
            <textarea
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Enter reason..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDepositId && modalAction) {
                    processAction(selectedDepositId, modalAction, reasonInput);
                    setShowReasonModal(false);
                  }
                }}
                disabled={!reasonInput.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
