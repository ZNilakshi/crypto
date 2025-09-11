// controllers/wallet.controller.js
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Withdrawal from "../models/Withdraw.js";
import Stake from "../models/Stake.js";
import CommissionLedger from "../models/CommissionLedger.js";
import Trade from "../models/Trading.js";

export const getWalletSummary = async (req, res) => {
  const user = await User.findById(req.userId);

  // 🔹 Step 1: Update AI Trading profits (daily credit)
  const trades = await Trade.find({ user: user._id, active: true });
  const now = new Date();

  for (const trade of trades) {
    const lastCalc = trade.lastProfitCalc || trade.createdAt;

    // full days since last profit credit
    const days = Math.floor((now - lastCalc) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const profit = trade.amount * trade.dailyRate * days;


      // update trade record
      trade.totalEarned += profit;
      trade.lastProfitCalc = now;
      await trade.save();
    }
  }

  await user.save();

  // 🔹 Step 2: Calculate stake totals
  const stakes = await Stake.find({ user: user._id, active: true });

  let stakeTotal = 0;             // total principal
  let stakeProfitPending = 0;     // profit for elapsed days not yet credited

  for (const s of stakes) {
    stakeTotal += s.amount;

    const lastPaid = s.lastDailyPaidAt || s.createdAt;
    const elapsedDays = Math.floor((now - new Date(lastPaid)) / (1000*60*60*24));

    if (elapsedDays > 0) {
      const profit = s.amount * s.dailyRate * elapsedDays;
      stakeProfitPending += profit;

      // Optionally credit wallet automatically:
      user.walletBalance += profit;
      s.lastDailyPaidAt = now;
      await s.save();
    }
  }


  // 🔹 Step 3: AI Trading totals
  const aiTradingTotal = trades.reduce((sum, t) => sum + t.amount, 0);
  const aiTradingProfit = trades.reduce((sum, t) => sum + t.totalEarned, 0);

  // 🔹 Step 4: Commissions
  const commissionsAgg = await CommissionLedger.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$user", total: { $sum: "$amount" } } },
  ]);
  const commissionsTotal = commissionsAgg?.[0]?.total || 0;

  // 🔹 Step 5: TOTAL USDT
  const totalUSDT = +(
    user.walletBalance + stakeTotal + commissionsTotal + aiTradingTotal
  ).toFixed(2);

  // 🔹 Step 6: Bonus breakdown
  const buckets = await CommissionLedger.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const byType = Object.fromEntries(buckets.map((b) => [b._id, b.total]));

  res.json({
    success: true,
    header: {
      walletBalance: +user.walletBalance.toFixed(2),
      stakeTotal: +stakeTotal.toFixed(2),
      stakeProfit: +stakeProfitPending.toFixed(2),   // ✅ fixed here
      commissionsTotal: +commissionsTotal.toFixed(2),
      aiTradingTotal: +aiTradingTotal.toFixed(2),
      aiTradingProfit: +aiTradingProfit.toFixed(2),
      totalUSDT,
    },
    bonus: {
      directDaily: +(byType["DIRECT_DAILY"] || 0).toFixed(2),
      l1_3: +(byType["INDIRECT_L1_3"] || 0).toFixed(2),
      l4_6: +(byType["INDIRECT_L4_6"] || 0).toFixed(2),
      leaderBonus: +(byType["LEADER_BONUS"] || 0).toFixed(2),
    },
  });
  
};


export const getMyTransactions = async (req, res) => {
  // deposits + withdrawals in one feed
  const [deps, wds] = await Promise.all([
    Deposit.find({ user: req.userId }).select("amount status createdAt txHash").lean(),
    Withdrawal.find({ user: req.userId }).select("amount status createdAt toAddress").lean()
  ]);
  res.json({ success:true, deposits: deps, withdrawals: wds });
};
