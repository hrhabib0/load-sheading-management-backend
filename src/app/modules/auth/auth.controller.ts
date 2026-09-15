import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    await AuthServices.registerUser(req.body);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Registration initiated. Please verify your email. Verification OTP is sent to your email.",
        data: null,
    });
});

const verifyUserEmail = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.verifyUserEmail(req.body);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Email verified successfully. Registration completed.",
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.loginUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Login Successful",
        data: result
    })
})

export const AuthController = {
    registerUser,
    verifyUserEmail,
    loginUser,
};

