import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  transactionHash: { type: String, required: true, unique: true },
  network: { type: String, enum: ["TRC20", "BEP20"], required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
  cryptoAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Deposit", depositSchema);
