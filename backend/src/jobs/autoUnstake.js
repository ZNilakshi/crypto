import cron from "node-cron";
import Stake from "../models/Stake.js";
import User from "../models/User.js";

/**
 * Automatically unlocks expired stakes and moves funds back to wallet.
 */
async function processExpiredStakes() {
  const now = new Date();

  // find all expired & active stakes
  const expiredStakes = await Stake.find({
    active: true,
    lockedUntil: { $lte: now }
  });

  for (const s of expiredStakes) {
    try {
      const user = await User.findById(s.user);
      if (!user) continue;

      const principal = s.amount;
      const profit = principal * s.dailyRate * s.lockDays;
      const totalRefund = principal + profit;

      // update user wallet
      user.walletBalance += totalRefund;
      user.totalStakes -= principal;

      // update stake
      s.active = false;
      s.amount = 0;

      await Promise.all([user.save(), s.save()]);

      console.log(
        `✅ Auto-unlocked stake ${s._id} for user ${user._id}. Refunded ${totalRefund.toFixed(
          2
        )} USDT (Profit: ${profit.toFixed(2)})`
      );
    } catch (err) {
      console.error("❌ Failed to auto-unlock stake:", err);
    }
  }
}

// run every day at midnight server time
cron.schedule("0 0 * * *", async () => {
  console.log("🚀 Running autoUnstake cron job...");
  await processExpiredStakes();
});

export default processExpiredStakes;
