"use client";

import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  DollarSign,
  User,
  Wallet,
} from "lucide-react";
interface Withdrawal {
  _id: string;
  amount: number;
  walletType?: string;
  toAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HOLD";
  reason?: string;
  createdAt: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
 const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [modalAction, setModalAction] = useState<"reject" | "hold" | null>(null);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  const router = useRouter();

  async function api(path: string, init?: RequestInit) {
    const token = auth.currentUser
      ? await getIdToken(auth.currentUser, true)
      : "";
    return fetch(process.env.NEXT_PUBLIC_API_BASE + path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json());
  }

  async function loadWithdrawals() {
    setIsLoading(true);
    try {
      const w = await api("/withdrawals/admin/all");
      setWithdrawals(w.items || []);
      setFilteredWithdrawals(w.items || []);
    } catch (error) {
      console.error("Error loading withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  useEffect(() => {
    let result = withdrawals;

    if (statusFilter !== "ALL") {
      result = result.filter((w) => w.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.user?.username?.toLowerCase().includes(term) ||
          w.user?.email?.toLowerCase().includes(term) ||
          w.toAddress?.toLowerCase().includes(term)
      );
    }

    setFilteredWithdrawals(result);
  }, [statusFilter, searchTerm, withdrawals]);

  function handleAction(id: string, action: "approve" | "reject" | "hold") {
    if (action === "approve") {
      processAction(id, action);
    } else {
      setSelectedWithdrawalId(id);
      setModalAction(action);
      setReasonInput("");
      setShowReasonModal(true);
    }
  }

  async function processAction(
    id: string,
    action: "approve" | "reject" | "hold",
    reason?: string
  ) {
    setIsLoading(true);
    try {
      await api(`/withdrawals/admin/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      loadWithdrawals();
    } catch (error) {
      console.error("Error processing action:", error);
      setIsLoading(false);
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "HOLD":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
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

  return (
    <div className="min-h-screen rounded-3xl text-black bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Wallet className="w-9 h-9 text-indigo-600" />
            Withdrawal Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Manage and review all pending USDT withdrawal requests.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Requests",
              value: withdrawals.length,
              color: "from-indigo-500 to-blue-500",
              icon: DollarSign,
            },
            {
              label: "Pending",
              value: withdrawals.filter((w) => w.status === "PENDING").length,
              color: "from-yellow-400 to-orange-400",
              icon: Clock,
            },
            {
              label: "Approved",
              value: withdrawals.filter((w) => w.status === "APPROVED").length,
              color: "from-green-400 to-emerald-500",
              icon: CheckCircle,
            },
            {
              label: "Rejected",
              value: withdrawals.filter((w) => w.status === "REJECTED").length,
              color: "from-red-400 to-pink-500",
              icon: XCircle,
            },
            {
              label: "Hold",
              value: withdrawals.filter((w) => w.status === "HOLD").length,
              color: "from-blue-400 to-blue-500",
              icon: XCircle,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className={`rounded-2xl p-5 shadow-md flex items-center gap-4 bg-gradient-to-r ${stat.color} text-white`}
              whileHover={{ scale: 1.05 }}
            >
              <stat.icon className="w-8 h-8 opacity-90" />
              <div>
                <div className="text-sm opacity-90">{stat.label}</div>
                <div className="text-3xl font-semibold">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="HOLD">Hold</option>
              </select>
            </div>

            <div className="w-full md:flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by username, email or wallet address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={loadWithdrawals}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Withdrawals Table */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-lg">
              No withdrawal requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "User",
                      "Amount (USDT)",
                      "Network",
                      "Wallet Address",
                      "Status",
                      "Reason",
                      "Requested",
                      "Actions",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="py-3 px-5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredWithdrawals.map((w) => (
                    <motion.tr
                      key={w._id}
                      className="hover:bg-slate-50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-indigo-500" />
                          <div>
                            <div className="font-medium text-slate-900">
                              {w.user?.username || "N/A"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {w.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-900">
                        {w.amount} USDT
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {w.walletType || "ERC20"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-xs font-mono text-slate-700 truncate max-w-xs">
                          {w.toAddress}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                            w.status
                          )}`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-500">
                        {w.reason || "-"}
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-500">
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="py-4 px-5">
                        {w.status === "PENDING" || w.status === "HOLD" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(w._id, "approve")}
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(w._id, "reject")}
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                            {w.status === "PENDING" && (
                              <button
                                onClick={() => handleAction(w._id, "hold")}
                                className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
        </motion.div>
      </motion.div>

      {/* Modal for Reject/Hold Reason */}
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
              {modalAction === "reject" ? "Reject Withdrawal" : "Put Withdrawal On Hold"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for this action.
            </p>
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
                  if (selectedWithdrawalId && modalAction) {
                    processAction(selectedWithdrawalId, modalAction, reasonInput);
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

