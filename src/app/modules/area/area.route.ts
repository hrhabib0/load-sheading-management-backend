import { Router } from "express";
import { AreaController } from "./area.controller.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { AreaValidation } from "./area.validate.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
    "/create-area",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(AreaValidation.createAreaSchema),
    AreaController.createArea,
);

// for staff
router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    AreaController.getAllAreas,
);

// get area data for registration
router.get("/customer-area", AreaController.getAllAreaForRegistration);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    AreaController.getAreaById,
);

router.patch(
    "/:id/status",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(AreaValidation.updateAreaStatusSchema),
    AreaController.updateAreaStatus,
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(AreaValidation.updateAreaSchema),
    AreaController.updateArea,
);

export const AreaRoutes = router;