// controllers/dashboard.controller.js
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";
import Stake from "../models/Stake.js";

// ✅ User Dashboard
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("directReferrals", "username totalStakes")
      .populate("activeDownlines", "username totalStakes");

    if (!user) return res.status(404).json({ message: "❌ User not found" });

    const deposits = await Deposit.find({ user: user._id, status: "confirmed" });
    const withdrawals = await Withdraw.find({ user: user._id, status: "approved" });
    const activeStakes = await Stake.find({ user: user._id, status: "active" });

    res.json({
      walletBalance: user.walletBalance,
      totalStakes: user.totalStakes,
      level: user.level,
      totalCommissions: user.totalCommissions,
      directReferrals: user.directReferrals.length,
      activeDownlines: user.activeDownlines.length,
      totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
      totalWithdrawals: withdrawals.reduce((sum, w) => sum + w.amount, 0),
      activeStakes,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};
