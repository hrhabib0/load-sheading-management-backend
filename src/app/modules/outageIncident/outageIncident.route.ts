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

router.patch(
    "/:id/start-repair",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    OutageIncidentController.startRepair,
);

router.patch(
    "/:id/restoration-pending",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    OutageIncidentController.markRestorationPending,
);

router.patch(
    "/:id/verify-restoration",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    OutageIncidentController.verifyRestoration,
);

router.patch(
    "/:id/close",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    validateRequest(OutageIncidentValidation.closeOutageIncidentSchema),
    OutageIncidentController.closeIncident,
);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    OutageIncidentController.getOutageIncidentById,
);


export const OutageIncidentRoutes = router;