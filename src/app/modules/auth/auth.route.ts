import { Router } from "express";
import { UserValidation } from "./auth.validate.js";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { auth } from "../../middleware/checkAuth.js";


const router = Router();


router.post(
    "/register",
    validateRequest(UserValidation.registerUserSchema),
    AuthController.registerUser
);

router.post(
    "/verify-email",
    validateRequest(UserValidation.verifyEmailSchema),
    AuthController.verifyUserEmail
);

router.post("/login", validateRequest(UserValidation.loginUserSchema), AuthController.loginUser,);

router.get("/me", auth(), AuthController.getMe);


export const AuthRoutes = router;