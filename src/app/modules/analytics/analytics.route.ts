import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { AnalyticsController } from "./analytics.controller.js";


const router = Router();

router.get("/admin-analytics", auth(UserRole.ADMIN), AnalyticsController.getAdminAnalytics)

export const AnalyticsRoutes = router;
