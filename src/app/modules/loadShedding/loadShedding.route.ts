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

export const LoadSheddingRoutes = router;