// controllers/level.controller.js
import User from "../models/User.js";

export async function updateUserLevel(userId) {
  const user = await User.findById(userId).populate("directReferrals", "firstDepositDone level");
  if (!user) return;

  let newLevel = user.level || 0;

  // Level 1: ≥5 directs with first deposit
  const directsWithDeposit = user.directReferrals.filter(d => d.firstDepositDone).length;
  if (newLevel < 1 && directsWithDeposit >= 5) newLevel = 1;

  // Level 2: ≥2 directs at Level 1
  const directsAtL1 = user.directReferrals.filter(d => d.level >= 1).length;
  if (newLevel < 2 && directsAtL1 >= 2) newLevel = 2;

  // Level 3: ≥2 directs at Level 2
  const directsAtL2 = user.directReferrals.filter(d => d.level >= 2).length;
  if (newLevel < 3 && directsAtL2 >= 2) newLevel = 3;

  // Level 4: ≥2 directs at Level 3
  const directsAtL3 = user.directReferrals.filter(d => d.level >= 3).length;
  if (newLevel < 4 && directsAtL3 >= 2) newLevel = 4;

  // Level 5: ≥2 directs at Level 4
  const directsAtL4 = user.directReferrals.filter(d => d.level >= 4).length;
  if (newLevel < 5 && directsAtL4 >= 2) newLevel = 5;

  // Level 6: ≥3 directs at Level 5
  const directsAtL5 = user.directReferrals.filter(d => d.level >= 5).length;
  if (newLevel < 6 && directsAtL5 >= 3) newLevel = 6;

  // Save only if level changed
  if (newLevel !== user.level) {
    user.level = newLevel;
    user.lastLevelUpdatedAt = new Date();
    await user.save();
  }
}
