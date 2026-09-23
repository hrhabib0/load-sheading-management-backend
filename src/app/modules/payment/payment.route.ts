import { Router } from "express";
import { PaymentControllers } from "./payment.controller.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";


const router = Router();


router.post(
    "/create",
    auth(UserRole.CUSTOMER),
    PaymentControllers.createPayment,
);
router.get(
    "/bkash/callback",
    PaymentControllers.bkashCallback,
);


export const PaymentRoutes = router;