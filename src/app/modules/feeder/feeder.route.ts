import { Router } from "express";
import { FeederController } from "./feeder.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { FeederValidation } from "./feeder.validate.js";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";


const router = Router();

router.post(
    "/create-feeder",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(FeederValidation.createFeederSchema),
    FeederController.createFeeder,
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    FeederController.getAllFeeders,
);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    FeederController.getFeederById,
);

router.patch(
    "/:id/status",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(FeederValidation.updateFeederStatusSchema),
    FeederController.updateFeederStatus,
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(FeederValidation.updateFeederSchema),
    FeederController.updateFeeder,
);

export const FeederRoutes = router;