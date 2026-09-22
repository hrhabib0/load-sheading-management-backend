import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createCustomerReportSchema } from "./customerReport.validate.js";
import { CustomerReportController } from "./customerReport.controller.js";
import { UserRole } from "../../../generated/prisma/enums.js";



const router = Router();

router.post(
    "/create-report",
    auth(UserRole.CUSTOMER),
    validateRequest(createCustomerReportSchema),
    CustomerReportController.createCustomerReport,
);

router.get(
    "/my-reports",
    auth(UserRole.CUSTOMER),
    CustomerReportController.getMyReports,
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    CustomerReportController.getAllReports,
);

router.get(
    "/:id",
    auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    CustomerReportController.getReportById,
);

router.patch(
    "/:id/cancel",
    auth(UserRole.CUSTOMER),
    CustomerReportController.cancelMyReport,
);

export const CustomerReportRoutes = router;