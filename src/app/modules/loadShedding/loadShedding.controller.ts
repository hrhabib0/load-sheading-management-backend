import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { LoadSheddingServices } from "./loadShedding.service.js";
import { sendResponse } from "../../utils/sendResponse.js";



const createLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;

        const result = await LoadSheddingServices.createLoadSheddingSchedule(
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Load-shedding schedule created successfully",
            data: result,
        });
    },
);

const getAllLoadSheddingSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await LoadSheddingServices.getAllLoadSheddingSchedules(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedules retrieved successfully",
            data: result,
        });
    },
);

const getLoadSheddingScheduleById = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.getLoadSheddingScheduleById(schedulesId, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule retrieved successfully",
            data: result,
        });
    },
);

const updateLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await LoadSheddingServices.updateLoadSheddingSchedule(
            schedulesId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule updated successfully",
            data: result,
        });
    },
);

export const LoadSheddingController = {
    createLoadSheddingSchedule,
    getAllLoadSheddingSchedules,
    getLoadSheddingScheduleById,
    updateLoadSheddingSchedule,
};