import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { OutageIncidentValidation } from "./outageIncident.validate.js";
import { OutageIncidentController } from "./outageIncident.controller.js";
import { UserRole } from "../../../generated/prisma/enums.js";



const router = Router();

router.post(
    "/create-incident",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    validateRequest(OutageIncidentValidation.createOutageIncidentSchema),
    OutageIncidentController.createOutageIncident,
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    OutageIncidentController.getAllOutageIncidents,
);

router.patch(
    "/:id/link-report",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    validateRequest(OutageIncidentValidation.linkCustomerReportSchema),
    OutageIncidentController.linkCustomerReport,
);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    OutageIncidentController.getOutageIncidentById,
);


export const OutageIncidentRoutes = router;