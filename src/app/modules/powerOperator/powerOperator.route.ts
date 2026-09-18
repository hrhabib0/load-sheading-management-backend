import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { powerOperatorController } from "./powerOperator.controller.js";
import { auth } from "../../middleware/checkAuth.js";

const router = Router();

router.get(
    "/",
    auth(UserRole.ADMIN),
    powerOperatorController.getAllPowerOperators
);

export const powerOperatorRoutes = router;