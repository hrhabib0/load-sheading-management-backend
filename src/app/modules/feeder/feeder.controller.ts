import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { FeederServices } from "./feeder.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createFeeder = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;
        const result = await FeederServices.createFeeder(payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Feeder created successfully",
            data: result,
        })
    },
);

const getAllFeeders = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;
        const result = await FeederServices.getAllFeeders(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Feeders retrieved successfully",
            data: result,
        })
    },
);

const getFeederById = catchAsync(
    async (req: Request, res: Response) => {
        const feedersId = req.params.id as string;
        const user = req.user!;
        const result = await FeederServices.getFeederById(feedersId, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Feeder retrieved successfully",
            data: result,
        })
    },
);

const updateFeeder = catchAsync(
    async (req: Request, res: Response) => {
        const feedersId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;
        const result = await FeederServices.updateFeeder(feedersId, payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Feeder updated successfully",
            data: result,
        })
    },
);

const updateFeederStatus = catchAsync(
    async (req: Request, res: Response) => {
        const feedersId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;
        const result = await FeederServices.updateFeederStatus(feedersId, payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.isActive
                ? "Feeder activated successfully"
                : "Feeder deactivated successfully",
            data: result,
        })
    },
);

export const FeederController = {
    createFeeder,
    getAllFeeders,
    getFeederById,
    updateFeeder,
    updateFeederStatus,
};