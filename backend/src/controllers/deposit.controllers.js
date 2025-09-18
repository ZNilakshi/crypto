// controllers/deposit.controller.js
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import { onFirstDepositConfirmed } from "./commission.controller.js";
import { updateUserLevel } from "./level.controller.js";

const SYSTEM_WALLETS = {
  TRC20: "TAbnTnhXFXe3okDSLwwSosZq6sZ6hSAAAA",
  BEP20: "0xBrnTnhXFXe3okDSLwwSosZq6sZ6hSBBBB"
};


export const createDeposit = async (req, res) => {
  try {
    const { amount, txHash, network } = req.body;

    if (!amount || !txHash || !network) {
      return res.status(400).json({ message: "Amount, txHash and network are required" });
    }

    const net = network.toUpperCase();
    if (!["TRC20", "BEP20"].includes(net)) {
      return res.status(400).json({ message: "Invalid network" });
    }

    const systemWallet = SYSTEM_WALLETS[net];

    const dep = await Deposit.create({
      user: req.userId,
      amount: +amount,
      txHash: txHash.trim(),
      network: net,
      systemWallet
    });

    res.status(201).json({ success: true, message: "Deposit submitted for verification", deposit: dep });
  } catch (e) {
    console.error(e);

    if (e.code === 11000 && e.keyPattern?.txHash) {
      return res.status(400).json({ success: false, message: "Transaction hash already submitted" });
    }

    res.status(500).json({ success: false, message: "Failed to create deposit" });
  }
};

export const listMyDeposits = async (req, res) => {
  const items = await Deposit.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

// ADMIN
export const adminListDeposits = async (req, res) => {
  const items = await Deposit.find().populate("user","username email level").sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

async function updateUplineLevels(userId) {
  let current = await User.findById(userId).select("referredBy");
  while (current?.referredBy) {
    await updateUserLevel(current.referredBy);
    current = await User.findById(current.referredBy).select("referredBy");
  }
}
// controllers/deposit.controller.js

export const adminDepositToUser = async (req, res) => {
  try {
    const { userId, amount, network } = req.body;

    if (!userId || !amount || !network) {
      return res.status(400).json({ success: false, message: "UserId, amount, and network required" });
    }

    const net = network.toUpperCase();
    if (!["TRC20", "BEP20"].includes(net)) {
      return res.status(400).json({ success: false, message: "Invalid network" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const systemWallet = SYSTEM_WALLETS[net];

    // Record deposit (no txHash required for admin top-up)
    const dep = await Deposit.create({
      user: userId,
      amount: +amount,
      txHash: `ADMIN-${Date.now()}`, // unique identifier
      network: net,
      systemWallet,
      status: "APPROVED",
    });

    // Update user balance instantly
    user.walletBalance = (user.walletBalance || 0) + +amount;
    user.totalUSDT = (user.totalUSDT || 0) + +amount;
    if (!user.referralUnlocked && user.walletBalance >= 100) {
      user.referralUnlocked = true;
    }
    await user.save();

    return res.status(201).json({
      success: true,
      message: `Deposited ${amount} to ${user.username}`,
      deposit: dep,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Admin deposit failed" });
  }
};


export const adminApproveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const dep = await Deposit.findById(id);
    if (!dep) return res.status(404).json({ message: "Deposit not found" });
    
    // Allow approval if PENDING or HOLD
    if (!["PENDING", "HOLD"].includes(dep.status))
      return res.status(400).json({ message: "Already processed" });

    dep.status = "APPROVED";
    await dep.save();

    const user = await User.findById(dep.user);
    user.totalUSDT = (user.totalUSDT || 0) + dep.amount;
    if (!user.referralUnlocked && user.totalUSDT >= 100) {
      user.referralUnlocked = true;
    }

    if (!user.firstDepositDone) {
      user.firstDepositDone = true;
      await user.save();
      dep.isFirstDepositForUser = true;
      await dep.save();

      await onFirstDepositConfirmed(user._id, dep._id, dep.amount, user.level ?? 0);
      if (user.referredBy) {
        await updateUserLevel(user.referredBy);
      }
    } else {
      await user.save();
    }

    res.json({ success:true, message:"Deposit approved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: "Approval failed" });
  }
};

export const adminRejectDeposit = async (req, res) => {
  const { id } = req.params;
  const dep = await Deposit.findById(id);
  if (!dep) return res.status(404).json({ message: "Deposit not found" });

  // Allow rejection if PENDING or HOLD
  if (!["PENDING", "HOLD"].includes(dep.status))
    return res.status(400).json({ message: "Already processed" });

  dep.status = "REJECTED";
  await dep.save();
  res.json({ success:true, message:"Deposit rejected" });
};

export const adminHoldDeposit = async (req, res) => {
  const { id } = req.params;
  const dep = await Deposit.findById(id);
  if (!dep) return res.status(404).json({ message: "Deposit not found" });

  // Only allow putting PENDING deposits on hold
  if (dep.status !== "PENDING")
    return res.status(400).json({ message: "Cannot hold a processed deposit" });

  dep.status = "HOLD";
  await dep.save();
  res.json({ success:true, message:"Deposit put on hold" });
};
