// controllers/stake.controller.js
import Stake from "../models/Stake.js";
import User from "../models/User.js";

// controllers/stake.controller.js
export const createStake = async (req, res) => {
  try {
    const { amount, lockDays } = req.body;
    const user = await User.findById(req.userId);

    if (amount < 50) return res.status(400).json({ message: "Min stake is 50" });
    if (user.walletBalance < amount) return res.status(400).json({ message: "Insufficient wallet balance" });

    // Determine daily rate
    let dailyRate;
    if (lockDays === 7) dailyRate = 0.013;
    else if (lockDays === 15) dailyRate = 0.014;
    else if (lockDays === 30) dailyRate = 0.015;
    else return res.status(400).json({ message: "Invalid lock period" });

    // Deduct from wallet
    user.walletBalance -= amount;
    user.totalStakes += amount;
    await user.save();

    const lockedUntil = new Date();
    lockedUntil.setDate(lockedUntil.getDate() + lockDays);

    const s = await Stake.create({ 
      user: user._id, 
      amount, 
      lockDays, 
      dailyRate, 
      lockedUntil 
    });

    res.status(201).json({ success:true, stake: s });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:"Stake failed" });
  }
};


export const listMyStakes = async (req, res) => {
  const items = await Stake.find({ user: req.userId, active: true }).sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

// Unstake function

export const unstake = async (req, res) => {
  try {
    const { stakeId } = req.body;
    const stake = await Stake.findById(stakeId);
    if (!stake || !stake.active) {
      return res.status(404).json({ message: "Stake not found" });
    }

    // Prevent unstake before lock expires
    if (new Date() < new Date(stake.lockedUntil)) {
      return res.status(400).json({ message: `Funds locked until ${stake.lockedUntil.toLocaleString()}` });
    }
    const principal = stake.amount;

    // ✅ Calculate profit
    const profit = principal * stake.dailyRate * stake.lockDays;

    // ✅ Total refund = principal + profit
    const totalRefund = stake.amount + profit;

    // Mark stake as inactive
    stake.active = false;
    stake.amount = 0;
    await stake.save();

    // Update user wallet
    const user = await User.findById(req.userId);
    user.walletBalance += totalRefund;
    user.totalStakes -= principal; // ✅ subtract original stake amount
    await user.save();

    res.json({ 
      success: true, 
      message: `Unstaked successfully. You received ${totalRefund.toFixed(2)} (including ${profit.toFixed(2)} profit)`, 
      profit: profit.toFixed(2),
      totalRefund: totalRefund.toFixed(2)
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:"Unstake failed" });
  }
};
