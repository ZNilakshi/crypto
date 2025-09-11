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

    // hold funds
    user.walletBalance -= amount;
    await user.save();

    const w = await Withdrawal.create({
      user: user._id,
      amount,
      toAddress: user.cryptoAddress,
      walletType: user.walletType,   // <-- add this

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

export const adminRejectWithdrawal = async (req, res) => {
  const { id } = req.params;
  const w = await Withdrawal.findById(id);
  if (!w) return res.status(404).json({ message: "Withdrawal not found" });
  if (w.status !== "PENDING") return res.status(400).json({ message: "Already processed" });

  // refund held funds on reject
  const user = await User.findById(w.user);
  user.walletBalance += w.amount;
  await user.save();

  w.status = "REJECTED";
  await w.save();
  res.json({ success:true, message:"Withdrawal rejected and funds returned" });
};
