import Deposit from "../models/Deposit.js";
import User from "../models/User.js";

// ✅ Create deposit
export const createDeposit = async (req, res) => {
  try {
    const { amount, transactionHash, network } = req.body;
    const userId = req.userId;

    if (!amount || !transactionHash || !network) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Prevent duplicate hash
    const existing = await Deposit.findOne({ transactionHash });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction hash already exists" });
    }

    // USDT deposit address for system
    const address =
      network === "TRC20"
        ? "TJ35Aak9p2e89Rpvd5P1jNxZZPMWYDma9w"
        : "0x97e11A3Df9F8c45F6B9a9a41b2F0c3f7Ee7c8Ab1";

    const deposit = new Deposit({
      user: userId,
      amount,
      transactionHash,
      network,
      cryptoAddress: address,
    });

    await deposit.save();

    res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      deposit,
    });
  } catch (error) {
    console.error("❌ Deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get user deposits
export const getUserDeposits = async (req, res) => {
  try {
    const userId = req.userId;
    const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, deposits });
  } catch (error) {
    console.error("❌ Fetch deposits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
