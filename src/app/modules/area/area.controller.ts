import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { AreaServices } from "./area.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createArea = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;

        const result = await AreaServices.createArea(payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Area created successfully",
            data: result,
        });
    },
);

const getAllAreas = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await AreaServices.getAllAreas(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Areas retrieved successfully",
            data: result,
        });
    },
);

const getAreaById = catchAsync(
    async (req: Request, res: Response) => {
        const areasId = req.params.id as string;
        const user = req.user!;

        const result = await AreaServices.getAreaById(
            areasId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Area retrieved successfully",
            data: result,
        });
    },
);

const updateArea = catchAsync(
    async (req: Request, res: Response) => {
        const areasId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await AreaServices.updateArea(
            areasId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Area updated successfully",
            data: result,
        });
    },
);

const updateAreaStatus = catchAsync(
    async (req: Request, res: Response) => {
        const areasId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await AreaServices.updateAreaStatus(
            areasId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.isActive
                ? "Area activated successfully"
                : "Area deactivated successfully",
            data: result,
        });
    },
);

export const AreaController = {
    createArea,
    getAllAreas,
    getAreaById,
    updateArea,
    updateAreaStatus,
};