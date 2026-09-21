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

router.patch(
    "/:id/submit",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.submitPlannedOutageForApproval,
);

router.patch(
    "/:id/approve",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.approvePlannedOutage,
);

router.patch(
    "/:id/publish",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.publishPlannedOutage,
);

router.patch(
    "/:id/start",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.startPlannedOutage,
);

router.patch(
    "/:id/complete",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.completePlannedOutage,
);

router.patch(
    "/:id/reject",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.rejectPlannedOutage,
);

router.patch(
    "/:id/cancel",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    PlannedOutageController.cancelPlannedOutage,
);

export const PlannedOutageRoutes = router;