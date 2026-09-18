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

const submitLoadSheddingScheduleForApproval = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.submitLoadSheddingScheduleForApproval(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule submitted for approval successfully",
            data: result,
        });
    },
);

const approveLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.approveLoadSheddingSchedule(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule approved successfully",
            data: result,
        });
    },
);

const publishLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.publishLoadSheddingSchedule(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule published successfully",
            data: result,
        });
    },
);

const startLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.startLoadSheddingSchedule(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding started successfully",
            data: result,
        });
    },
);

const completeLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.completeLoadSheddingSchedule(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding completed successfully",
            data: result,
        });
    },
);

const cancelLoadSheddingSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const schedulesId = req.params.id as string;
        const user = req.user!;

        const result = await LoadSheddingServices.cancelLoadSheddingSchedule(
            schedulesId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Load-shedding schedule cancelled successfully",
            data: result,
        });
    },
);

export const LoadSheddingController = {
    createLoadSheddingSchedule,
    getAllLoadSheddingSchedules,
    getLoadSheddingScheduleById,
    updateLoadSheddingSchedule,
    submitLoadSheddingScheduleForApproval,
    approveLoadSheddingSchedule,
    publishLoadSheddingSchedule,
    startLoadSheddingSchedule,
    completeLoadSheddingSchedule,
    cancelLoadSheddingSchedule,
};