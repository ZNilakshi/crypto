// controllers/deposit.controller.js
import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import { onFirstDepositConfirmed } from "./commission.controller.js";

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


export const adminApproveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const dep = await Deposit.findById(id);
    if (!dep) return res.status(404).json({ message: "Deposit not found" });
    if (dep.status !== "PENDING") return res.status(400).json({ message: "Already processed" });

    dep.status = "APPROVED";
    await dep.save();

    const user = await User.findById(dep.user);
    // credit wallet balance
    user.walletBalance += dep.amount;

    // mark referral unlock if reached ≥100
    if (!user.referralUnlocked && user.walletBalance >= 100) {
      user.referralUnlocked = true;
    }

    // first deposit triggers network commissions
    if (!user.firstDepositDone) {
      user.firstDepositDone = true;
      await user.save();
      dep.isFirstDepositForUser = true;
      await dep.save();

      await onFirstDepositConfirmed(user._id, dep._id, dep.amount, user.level ?? 0);
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
  if (dep.status !== "PENDING") return res.status(400).json({ message: "Already processed" });
  dep.status = "REJECTED";
  await dep.save();
  res.json({ success:true, message:"Deposit rejected" });
};
