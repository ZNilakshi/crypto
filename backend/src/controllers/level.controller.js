import User from "../models/User.js";

// Update user level based on totalUSDT and downline totals
export async function updateUserLevel(userId) {
  const user = await User.findById(userId)
    .populate("directReferrals", "totalUSDT level"); // fetch totalUSDT & level
  if (!user) return;

  let newLevel = 0;

  // 🔹 LEVEL 1
  // User totalUSDT ≥ 100 AND 5 directs with totalUSDT ≥ 100
  const directsWith100USDT = user.directReferrals.filter(d => d.totalUSDT >= 100).length;
  if (user.totalUSDT >= 100 && directsWith100USDT >= 5) newLevel = 1;

  // 🔹 LEVEL 2
  // 2 directs at Level 1 AND each has totalUSDT ≥ 100
  const directsAtL1 = user.directReferrals.filter(d => d.level >= 1 && d.totalUSDT >= 100).length;
  if (newLevel < 2 && directsAtL1 >= 2) newLevel = 2;

  // 🔹 LEVEL 3
  const directsAtL2 = user.directReferrals.filter(d => d.level >= 2 && d.totalUSDT >= 100).length;
  if (newLevel < 3 && directsAtL2 >= 2) newLevel = 3;

  // 🔹 LEVEL 4
  const directsAtL3 = user.directReferrals.filter(d => d.level >= 3 && d.totalUSDT >= 100).length;
  if (newLevel < 4 && directsAtL3 >= 2) newLevel = 4;

  // 🔹 LEVEL 5
  const directsAtL4 = user.directReferrals.filter(d => d.level >= 4 && d.totalUSDT >= 100).length;
  if (newLevel < 5 && directsAtL4 >= 2) newLevel = 5;

  // 🔹 LEVEL 6
  const directsAtL5 = user.directReferrals.filter(d => d.level >= 5 && d.totalUSDT >= 100).length;
  if (newLevel < 6 && directsAtL5 >= 3) newLevel = 6;

  // Save only if level changed
  if (newLevel !== user.level) {
    user.level = newLevel;
    user.lastLevelUpdatedAt = new Date();
    await user.save();
  }
}
