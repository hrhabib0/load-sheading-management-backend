import { Router } from "express";
import { UserValidation } from "./auth.validate.js";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";


const router = Router();


router.post(
    "/register",
    // validateRequest(UserValidation.registerUserSchema),
    AuthController.registerUser
);

router.post(
    "/verify-email",
    validateRequest(UserValidation.verifyEmailSchema),
    AuthController.verifyUserEmail
);


export const AuthRoutes = router;