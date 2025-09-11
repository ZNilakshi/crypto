import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"; // <-- expects export default
import depositRoutes from "./src/routes/deposit.routes.js";
import adminDepositRoutes from "./src/routes/admin/adminDeposit.routes.js";
import withdrawalRoutes from "./src/routes/withdraw.routes.js";
import "./cron.js";
import stakeRoutes from "./src/routes/stake.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import walletRoutes from "./src/routes/wallet.route.js";
import tradingRoutes from "./src/routes/trading.route.js";
import adminRoutes from "./src/routes/admin.route.js"; // if you have admin routes

import "./src/jobs/autoUnstake.js"; // start the cron job

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/wallet", walletRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/stakes", stakeRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use("/api/admin/deposits", adminDepositRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/admin", adminRoutes);    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
