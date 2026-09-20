import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { PlannedOutageController } from "./plannedOutage.controller.js";
import { UserRole } from "../../../generated/prisma/enums.js";


const router = Router();

router.post(
    "/create-planned-outage",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.createPlannedOutage,
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.getAllPlannedOutages,
);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.getPlannedOutageById,
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.updatePlannedOutage,
);

export const PlannedOutageRoutes = router;