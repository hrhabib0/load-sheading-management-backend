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

export const CustomerRoutes = router;