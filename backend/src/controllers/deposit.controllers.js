// controllers/deposit.controller.js
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import { onFirstDepositConfirmed } from "./commission.controller.js";
import { updateUserLevel } from "./level.controller.js";
import { sendDepositStatusEmail } from '../utils/emailService.js';


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

    const dep = await Deposit.findById(id).populate("user", "username email");
    if (!dep) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    if (dep.status !== "PENDING" && dep.status !== "HOLD") {
      return res.status(400).json({ success: false, message: "Deposit already processed" });
    }

    // Approve deposit
    dep.status = "APPROVED";
    await dep.save();

    const user = await User.findById(dep.user);

    // ✅ Update BOTH balances
    user.totalUSDT = (user.totalUSDT || 0) + dep.amount;
    user.walletBalance = (user.walletBalance || 0) + dep.amount;

    // ✅ Unlock referral if 100+ reached
    if (!user.referralUnlocked && user.totalUSDT >= 100) {
      user.referralUnlocked = true;
    }

    // ✅ First deposit logic
    if (!user.firstDepositDone) {
      user.firstDepositDone = true;
      dep.isFirstDepositForUser = true;

      await onFirstDepositConfirmed(user._id, dep._id, dep.amount, user.level ?? 0);

      if (user.referredBy) {
        await User.updateOne(
          { _id: user.referredBy },
          { $addToSet: { referredUsers: user._id } }
        );
        await User.updateOne(
          { _id: user.referredBy },
          { $inc: { totalDirectRefs: 1 } }
        );
      }
    }

    await user.save();

    // ✅ Send notification
    sendDepositStatusEmail(
      dep.user.email,
      dep.user.username,
      "APPROVED",
      {
        amount: dep.amount,
        createdAt: dep.createdAt,
        txHash: dep.txHash,
        systemWallet: dep.systemWallet
      }
    ).catch(console.error);

    res.json({ success: true, message: "Deposit approved and wallet updated" });
  } catch (err) {
    console.error("Approve deposit error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const adminRejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const dep = await Deposit.findById(id).populate('user', 'username email');
    if (!dep) return res.status(404).json({ message: "Deposit not found" });

    if (!["PENDING", "HOLD"].includes(dep.status))
      return res.status(400).json({ message: "Already processed" });

    dep.status = "REJECTED";
    dep.reason = reason || "No reason provided";
    await dep.save();

    // Send rejection email (don't await to avoid blocking response)
    sendDepositStatusEmail(
      dep.user.email, 
      dep.user.username, 
      'REJECTED', 
      { 
        amount: dep.amount, 
        createdAt: dep.createdAt, 
        txHash: dep.txHash 
      },
      reason
    ).catch(error => {
      console.error('Failed to send rejection email:', error);
    });

    res.json({ success:true, message:"Deposit rejected" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: "Rejection failed" });
  }
};

export const adminHoldDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const dep = await Deposit.findById(id).populate('user', 'username email');
    if (!dep) return res.status(404).json({ message: "Deposit not found" });

    if (dep.status !== "PENDING")
      return res.status(400).json({ message: "Cannot hold a processed deposit" });

    dep.status = "HOLD";
    dep.reason = reason || "No reason provided";
    await dep.save();

    // Send hold email (don't await to avoid blocking response)
    sendDepositStatusEmail(
      dep.user.email, 
      dep.user.username, 
      'HOLD', 
      { 
        amount: dep.amount, 
        createdAt: dep.createdAt, 
        txHash: dep.txHash 
      },
      reason
    ).catch(error => {
      console.error('Failed to send hold email:', error);
    });

    res.json({ success:true, message:"Deposit put on hold" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: "Hold operation failed" });
  }
};