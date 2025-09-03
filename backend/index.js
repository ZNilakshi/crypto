import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"; // <-- expects export default
import depositRoutes from "./src/routes/deposit.routes.js";
import adminDepositRoutes from "./src/routes/admin/adminDeposit.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/deposits", depositRoutes);
app.use("/api/admin/deposits", adminDepositRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
