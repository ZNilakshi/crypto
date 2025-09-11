 // jobs/daily.direct.js
import { payDailyDirect } from "../controllers/commission.controller.js";

export async function runDailyDirectJob() {
  await payDailyDirect();
}
