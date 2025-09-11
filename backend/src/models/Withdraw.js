// models/Withdrawal.js
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 },
  toAddress: { type: String, required: true },
  walletType: {          // ✅ network (TRC20 / BEP20)
    type: String,
    enum: ["TRC20", "BEP20"],
    required: true
  },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.model("Withdrawal", withdrawalSchema);
