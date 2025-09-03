// models/Withdrawal.js
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "processed"],
    default: "pending",
  },
  transactionHash: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Withdrawal", withdrawalSchema);