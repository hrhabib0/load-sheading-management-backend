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

const getAllCustomers = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await CustomerServices.getAllCustomers(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customers retrieved successfully",
            data: result,
        });
    },
);

const getCustomerById = catchAsync(
    async (req: Request, res: Response) => {
        const customersId = req.params.id as string;
        const user = req.user!;

        const result = await CustomerServices.getCustomerById(
            customersId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer retrieved successfully",
            data: result,
        });
    },
);

const updateCustomerByStaff = catchAsync(
    async (req: Request, res: Response) => {
        const customersId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await CustomerServices.updateCustomerByStaff(
            customersId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer updated successfully",
            data: result,
        });
    },
);

const updateCustomerStatus = catchAsync(
    async (req: Request, res: Response) => {
        const customersId = req.params.id as string;
        const payload = req.body;

        const result = await CustomerServices.updateCustomerStatus(
            customersId,
            payload,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.isActive
                ? "Customer activated successfully"
                : "Customer deactivated successfully",
            data: result,
        });
    },
);

export const CustomerController = {
    getMyProfile,
    updateMyProfile,
    getAllCustomers,
    getCustomerById,
    updateCustomerByStaff,
    updateCustomerStatus
};