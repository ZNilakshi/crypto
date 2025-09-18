// controllers/withdrawal.controller.js
import Withdrawal from "../models/Withdraw.js";
import User from "../models/User.js";

export const requestWithdraw = async (req, res) => {
  try {
    const { amount, securityPassword } = req.body;
    const user = await User.findById(req.userId).select("+securityPassword cryptoAddress walletType walletBalance");
    if (!user.cryptoAddress) return res.status(400).json({ message: "No crypto address set" });
    if (!securityPassword) return res.status(400).json({ message: "Security password required" });
    const ok = await user.verifySecurityPassword(securityPassword);
    if (!ok) return res.status(400).json({ message: "Security password incorrect" });

    if (amount <= 0 || amount > user.walletBalance) return res.status(400).json({ message: "Invalid amount" });
    const feePercent = 0.05;
    const fee = amount * feePercent;
    const totalDeduction = amount + fee;   // user pays this much
    
    if (totalDeduction > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient balance including withdrawal fee" });
    }
    
    // hold funds
    user.walletBalance -= totalDeduction;   // ✅ deduct full amount including fee
    await user.save();
    
    const w = await Withdrawal.create({
      user: user._id,
      amount,
      fee,                   // store fee separately
      totalDeduction,        // useful for admin view
      toAddress: user.cryptoAddress,
      walletType: user.walletType,
    });
    

    res.status(201).json({ success:true, withdrawal: w });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: "Withdraw request failed" });
  }
};

export const listMyWithdrawals = async (req, res) => {
  const items = await Withdrawal.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

// ADMIN
export const adminListWithdrawals = async (req, res) => {
  const items = await Withdrawal.find().populate("user","username email walletBalance walletType").sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

export const adminApproveWithdrawal = async (req, res) => {
  const { id } = req.params;
  const w = await Withdrawal.findById(id);
  if (!w) return res.status(404).json({ message: "Withdrawal not found" });
  if (w.status !== "PENDING") return res.status(400).json({ message: "Already processed" });

  w.status = "APPROVED";
  await w.save();
  res.json({ success:true, message:"Withdrawal approved" });
};
export const adminHoldWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ message: "Withdrawal not found" });
    if (w.status === "APPROVED" || w.status === "REJECTED")
      return res.status(400).json({ message: "Cannot hold processed withdrawal" });

    w.status = "HOLD";
    await w.save();
    res.json({ success: true, message: "Withdrawal put on hold" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to hold withdrawal" });
  }
};

export const adminRejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const w = await Withdrawal.findById(id);
    if (!w) return res.status(404).json({ message: "Withdrawal not found" });

    if (w.status === "APPROVED" || w.status === "REJECTED") {
      return res.status(400).json({ message: "Cannot reject already processed withdrawal" });
    }

    w.status = "REJECTED";
    await w.save();

    res.json({ success: true, message: "Withdrawal rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to reject withdrawal" });
  }
};
