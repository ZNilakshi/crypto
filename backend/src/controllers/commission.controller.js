import User from "../models/User.js";
import CommissionLedger from "../models/CommissionLedger.js";
import Deposit from "../models/Deposit.js";
import { getIndirectPct, LEADER_MIN_LEVEL, LEADER_BONUS_FLAT, REFERRAL_UNLOCK_ONE_TIME } from "./commission.rules.js";

// helper: total deposit ≥ $100
async function hasDeposit100(userId) {
  const agg = await Deposit.aggregate([
    { $match: { user: userId, status: "APPROVED" } },
    { $group: { _id: "$user", total: { $sum: "$amount" } } }
  ]);
  return (agg?.[0]?.total || 0) >= 100;
}

function isReferralUnlocked(uplineUser) {
  return uplineUser.totalUSDT >= REFERRAL_UNLOCK_ONE_TIME;
}

export async function onFirstDepositConfirmed(newDepositorId, depositId, depositAmount, newDepositorLevel) {
  if (depositAmount < 100) return; // ❌ rule: downline must deposit ≥100

  const uplineChain = [];
  let current = await User.findById(newDepositorId).select("referredBy level totalUSDT");
  while (current?.referredBy && uplineChain.length < 10) {
    const up = await User.findById(current.referredBy).select("referredBy level totalUSDT");
    if (!up) break;
    uplineChain.push(up);
    current = up;
  }

  // INDIRECT
  for (let i = 0; i < Math.min(6, uplineChain.length); i++) {
    const earner = await User.findById(uplineChain[i]._id);
    if (!earner) continue;

    if (!isReferralUnlocked(earner)) continue;
    if ((earner.level ?? 0) <= (newDepositorLevel ?? 0)) continue;

    const pct = getIndirectPct(earner.level ?? 0, i+1);
    if (pct <= 0) continue;

    const amount = +(depositAmount * (pct/100)).toFixed(2);
    if (amount <= 0) continue;

    await CommissionLedger.create({
      user: earner._id,
      sourceUser: newDepositorId,
      deposit: depositId,
      type: i+1 <= 3 ? "INDIRECT_L1_3" : "INDIRECT_L4_6",
      layer: i+1, percentage: pct, amount,
      note: `Indirect commission L${i+1} on first deposit`
    });

    earner.walletBalance += amount;
    earner.totalCommissionEarned += amount;
    await earner.save();
  }

  // LEADER BONUS
  for (const leader of uplineChain) {
    if ((leader.level ?? 0) >= LEADER_MIN_LEVEL && isReferralUnlocked(leader)) {
      await CommissionLedger.create({
        user: leader._id,
        sourceUser: newDepositorId,
        deposit: depositId,
        type: "LEADER_BONUS",
        amount: LEADER_BONUS_FLAT,
        note: "Leader bonus on new account first deposit"
      });
      leader.walletBalance += LEADER_BONUS_FLAT;
      leader.totalCommissionEarned += LEADER_BONUS_FLAT;
      await leader.save();
    }
  }
}
