import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { CustomerController } from "./customer.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { CustomerValidation } from "./customer.validate.js";
import { UserRole } from "../../../generated/prisma/enums.js";


const router = Router();

router.get(
    "/me",
    auth(UserRole.CUSTOMER),
    CustomerController.getMyProfile,
);

router.patch(
    "/me",
    auth(UserRole.CUSTOMER),
    validateRequest(CustomerValidation.updateCustomerSchema),
    CustomerController.updateMyProfile,
);

// Admin / Zone Manager / Power Operator
router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    CustomerController.getAllCustomers,
);

router.get(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    CustomerController.getCustomerById,
);


// Admin / Zone Manager
router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER),
    validateRequest(CustomerValidation.updateCustomerByStaffSchema),
    CustomerController.updateCustomerByStaff,
);


// Admin only
router.patch(
    "/:id/status",
    auth(UserRole.ADMIN),
    validateRequest(CustomerValidation.updateCustomerStatusSchema),
    CustomerController.updateCustomerStatus,
);


export const CustomerRoutes = router;