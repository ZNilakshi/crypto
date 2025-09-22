// controllers/dashboard.controller.js
import User from "../models/User.js";
import CommissionLedger from "../models/CommissionLedger.js";




// 🔹 Dashboard with commissions + referrals
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // commissions by type
    const commissions = await CommissionLedger.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);
    const byType = Object.fromEntries(commissions.map(c => [c._id, c.total]));

    // referrals (all layers)
    const referrals = await getReferralsRecursive(user._id, 1, 6);

    res.json({
      success: true,
      walletBalance: user.walletBalance,
      totalStakes: user.totalStakes,
      level: user.level,
      totalCommissionEarned: user.totalCommissionEarned,

      // Commission breakdown
      directCommissions: byType["DIRECT_DAILY"] || 0,
      layer1_3Commissions: byType["INDIRECT_L1_3"] || 0,
      layer4_6Commissions: byType["INDIRECT_L4_6"] || 0,
      leaderBonus: byType["LEADER_BONUS"] || 0,

      // Referral details for table
      referrals,
    });
  } catch (err) {
    console.error("❌ Dashboard fetch error:", err);
    res.status(500).json({ success: false, message: "Dashboard fetch failed" });
  }
};
