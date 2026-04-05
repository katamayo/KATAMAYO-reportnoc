import { Router } from "express";
import authRoutes from "./auth.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

// Mount sub-routers
router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);

export default router;
