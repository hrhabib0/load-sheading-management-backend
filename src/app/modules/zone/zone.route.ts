import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ZoneController } from "./zone.controller.js";
import { ZoneValidation } from "./zone.validate.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();


router.post(
    "/create-zone",
    auth(UserRole.ADMIN),
    validateRequest(ZoneValidation.createZoneSchema),
    ZoneController.createZone,
);


export const ZoneRoutes = router;