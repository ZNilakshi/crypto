// controllers/commission.controller.js
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Stake from "../models/Stake.js";
import CommissionLedger from "../models/CommissionLedger.js";
import { getIndirectPct, MIN_STAKE_FOR_DAILY, LEADER_MIN_LEVEL, LEADER_BONUS_FLAT, REFERRAL_UNLOCK_ONE_TIME } from "./commission.rules.js";

/** Walk upline up to 6 layers */
async function getUplineChain(userId, maxLayers=6) {
  const chain = [];
  let current = await User.findById(userId).select("referredBy level walletBalance referralUnlocked");
  let steps = 0;
  while (current?.referredBy && steps < maxLayers) {
    const up = await User.findById(current.referredBy).select("referredBy level walletBalance referralUnlocked");
    if (!up) break;
    chain.push(up);
    current = up;
    steps++;
  }
  return chain; // from layer 1 upwards
}

/** Check referral unlock gate (one-time $100 top-up in wallet) */
function isReferralUnlocked(uplineUser) {
  return !!uplineUser.referralUnlocked || (uplineUser.walletBalance >= REFERRAL_UNLOCK_ONE_TIME);
}

/** Mark unlock flag once they have ≥$100 */
async function ensureReferralUnlockFlag(uplineUser) {
  if (!uplineUser.referralUnlocked && uplineUser.walletBalance >= REFERRAL_UNLOCK_ONE_TIME) {
    uplineUser.referralUnlocked = true;
    await uplineUser.save();
  }
}

/** Award INDIRECT commissions and Leader Bonuses on FIRST confirmed deposit only */
export async function onFirstDepositConfirmed(newDepositorId, depositId, depositAmount, newDepositorLevel) {
  const upline = await getUplineChain(newDepositorId, 10); // we’ll only pay up to 6, but can search deeper for leaders
  // INDIRECT: pay only to first 6 layers, % depends on earner's level band; only if earner.level > downline.level; and only on FIRST deposit
  for (let i = 0; i < Math.min(6, upline.length); i++) {
    const earner = await User.findById(upline[i]._id);
    // Gate: referral unlocked
    await ensureReferralUnlockFlag(earner);
    if (!isReferralUnlocked(earner)) continue;

    // Rule: earn only if your level is higher than downline’s level
    if ((earner.level ?? 0) <= (newDepositorLevel ?? 0)) continue;

    const layer = i + 1;
    const pct = getIndirectPct(earner.level ?? 0, layer);
    if (pct <= 0) continue;

    const amount = +(depositAmount * (pct/100)).toFixed(2);
    if (amount <= 0) continue;

    await CommissionLedger.create({
      user: earner._id,
      sourceUser: newDepositorId,
      deposit: depositId,
      type: layer <=3 ? "INDIRECT_L1_3" : "INDIRECT_L4_6",
      layer, percentage: pct, amount,
      note: `Indirect commission L${layer} on first deposit`
    });

    earner.walletBalance += amount;
    earner.totalCommissionEarned += amount;
    await earner.save();
  }

  // LEADER BONUS: every leader (Level ≥ 1) anywhere in the upline chain receives $0.05 flat
  for (let i = 0; i < upline.length; i++) {
    const leader = await User.findById(upline[i]._id);
    if ((leader.level ?? 0) >= LEADER_MIN_LEVEL) {
      // also require referral unlocked
      await ensureReferralUnlockFlag(leader);
      if (!isReferralUnlocked(leader)) continue;

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


