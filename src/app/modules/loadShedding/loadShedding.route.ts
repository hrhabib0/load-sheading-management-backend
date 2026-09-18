import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { LoadSheddingValidation } from "./loadShedding.validate.js";
import { LoadSheddingController } from "./loadShedding.controller.js";


const router = Router();

router.post(
    "/create-schedule",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    validateRequest(
        LoadSheddingValidation.createLoadSheddingScheduleSchema,
    ),
    LoadSheddingController.createLoadSheddingSchedule,
);

router.get(
    "/schedules",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.getAllLoadSheddingSchedules,
);

router.get(
    "/schedules/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.getLoadSheddingScheduleById,
);

router.patch(
    "/schedules/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    validateRequest(
        LoadSheddingValidation.updateLoadSheddingScheduleSchema,
    ),
    LoadSheddingController.updateLoadSheddingSchedule,
);


router.patch(
    "/schedules/:id/submit",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.submitLoadSheddingScheduleForApproval,
);

router.patch(
    "/schedules/:id/approve",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    LoadSheddingController.approveLoadSheddingSchedule,
);

router.patch(
    "/schedules/:id/publish",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.publishLoadSheddingSchedule,
);

router.patch(
    "/:id/start",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.startLoadSheddingSchedule,
);

router.patch(
    "/:id/complete",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    LoadSheddingController.completeLoadSheddingSchedule,
);

export const LoadSheddingRoutes = router;