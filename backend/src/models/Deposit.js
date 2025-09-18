// models/Deposit.js
import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 10 }, // enforce minimum 10
  txHash: { type: String, required: true, unique: true, trim: true },
  network: { type: String, enum: ["TRC20", "BEP20"], required: true },
  systemWallet: { type: String, required: true }, // backend-assigned wallet
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "HOLD"], default: "PENDING" },
  isFirstDepositForUser: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Deposit", depositSchema);
