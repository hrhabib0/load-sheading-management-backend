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

const logoutUser = catchAsync(async (_req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(httpStatus.OK).json({
        success: true,
        message: "Logout successful",
    });
});

const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
    // step-1: check refreshToken exist or not in the cookies.
    const refreshToken = req.cookies.refreshToken;

    // step-2: send the refresh token to service file and recieve new accessToken and refreshToken from the result.
    const result = await AuthServices.refreshAccessToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = result;

    // step-3: set tokens in the cookie.
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // step-4: send final response
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});


export const AuthController = {
    registerUser,
    verifyUserEmail,
    loginUser,
    getMe,
    logoutUser,
    refreshAccessToken,
};

