// models/CommissionLedger.js
import mongoose from "mongoose";

const commissionLedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // earner
  sourceUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // downline who triggered it (for indirect/leader)
  deposit: { type: mongoose.Schema.Types.ObjectId, ref: "Deposit", required: false },
  stake: { type: mongoose.Schema.Types.ObjectId, ref: "Stake", required: false },

  type: {
    type: String,
    enum: ["DIRECT_DAILY","INDIRECT_L1_3","INDIRECT_L4_6","LEADER_BONUS"],
    required: true
  },
  layer: { type: Number, default: null }, // 1..6 for indirect
  percentage: { type: Number, default: 0 },
  amount: { type: Number, required: true },

  note: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("CommissionLedger", commissionLedgerSchema);
