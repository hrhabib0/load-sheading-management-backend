import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { CustomerServices } from "./customer.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const getMyProfile = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await CustomerServices.getMyProfile(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer profile retrieved successfully",
            data: result,
        });
    },
);

const updateMyProfile = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;

        const result = await CustomerServices.updateMyProfile(
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer profile updated successfully",
            data: result,
        });
    },
);

export const CustomerController = {
    getMyProfile,
    updateMyProfile,
};