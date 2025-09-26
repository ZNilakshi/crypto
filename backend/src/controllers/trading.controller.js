import Trading from "../models/Trading.js";
import User from "../models/User.js";

// Create new trading investment
export const createTrading = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (amount < 10) return res.status(400).json({ message: "Minimum trading is 10 USDT" });
    if (user.walletBalance < amount) return res.status(400).json({ message: "Insufficient wallet balance" });

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    const trade = await Trading.create({
      user: user._id,
      amount,
      dailyRate: 0.012, // default 1.2% daily, can be changed per trade
      lockDays: 1,      // 1 day lock
      lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      active: true
    });

    res.status(201).json({ success: true, trade });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Trading failed" });
  }
};

// List all user tradings
export const listTradings = async (req, res) => {
  try {
    const trades = await Trading.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, items: trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to list trades" });
  }
};


export const unlockTrading = async (req, res) => {
  const trade = await Trading.findById(req.params.id);
  if (!trade) {
    return res.status(404).json({ success: false, message: "Trade not found" });
  }
  if (!trade.active) {
    return res.status(400).json({ success: false, message: "Already unlocked" });
  }
  if (new Date() < trade.lockedUntil) {
    return res.status(400).json({ success: false, message: "Still locked" });
  }

  const user = await User.findById(trade.user);

  // ✅ Only return the principal — profits are already credited daily in getWalletSummary
  user.walletBalance += trade.amount + trade.totalEarned;

  trade.active = false;
  await trade.save();
  await user.save();

  res.json({
    success: true,
    message: "Trading unlocked and principal returned",
    walletBalance: +user.walletBalance.toFixed(2),
  });
};
