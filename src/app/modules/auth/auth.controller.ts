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
    const { accessToken, refreshToken, user } = await AuthServices.loginUser(req.body);

    // set token into cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Login Successful",
        data: { user }
    })
})

const getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId!
    const result = await AuthServices.getMe(userId);

    res.status(httpStatus.OK).json({
        success: true,
        message: "User profile retrieved successfully",
        data: result,
    });
});

export const AuthController = {
    registerUser,
    verifyUserEmail,
    loginUser,
    getMe
};

