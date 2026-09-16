import { Router } from "express";
import { SubstationController } from "./substation.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { SubstationValidation } from "./substation.validate.js";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";


const router = Router();

// Create
router.post(
    "/create-substation",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(SubstationValidation.createSubstationSchema),
    SubstationController.createSubstation,
);

// Get all
router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    SubstationController.getAllSubstations,
);

// Get by ID
router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    SubstationController.getSubstationById,
);

// Activate / Deactivate
router.patch(
    "/:id/status",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(SubstationValidation.updateSubstationStatusSchema),
    SubstationController.updateSubstationStatus,
);

// Update
router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(SubstationValidation.updateSubstationSchema),
    SubstationController.updateSubstation,
);

export const SubstationRoutes = router;