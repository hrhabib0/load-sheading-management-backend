import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { UserController } from "./user.controller.js";

const router = Router();


router.get(
    "/",
    auth(UserRole.ADMIN),
    UserController.getAllUsers,
);


export const UserRoutes = router;