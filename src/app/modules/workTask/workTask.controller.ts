import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { WorkTaskServices } from "./workTask.service.js";
import { sendResponse } from "../../utils/sendResponse.js";



const createWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;

        const result = await WorkTaskServices.createWorkTask(
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Work task created successfully",
            data: result,
        });
    },
);


const assignWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await WorkTaskServices.assignWorkTask(
            taskId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task assigned successfully",
            data: result,
        });
    },
);


const getAllWorkTasks = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await WorkTaskServices.getAllWorkTasks(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work tasks retrieved successfully",
            data: result,
        });
    },
);


const getWorkTaskById = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const user = req.user!;

        const result = await WorkTaskServices.getWorkTaskById(
            taskId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task retrieved successfully",
            data: result,
        });
    },
);


const acceptWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const user = req.user!;

        const result = await WorkTaskServices.acceptWorkTask(
            taskId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task accepted successfully",
            data: result,
        });
    },
);


const rejectWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await WorkTaskServices.rejectWorkTask(
            taskId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task rejected successfully",
            data: result,
        });
    },
);


const startWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const user = req.user!;

        const result = await WorkTaskServices.startWorkTask(
            taskId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task started successfully",
            data: result,
        });
    },
);


const completeWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await WorkTaskServices.completeWorkTask(
            taskId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task completed successfully",
            data: result,
        });
    },
);


const failWorkTask = catchAsync(
    async (req: Request, res: Response) => {
        const taskId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;

        const result = await WorkTaskServices.failWorkTask(
            taskId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work task marked as failed",
            data: result,
        });
    },
);


export const WorkTaskController = {
    createWorkTask,
    assignWorkTask,
    getAllWorkTasks,
    getWorkTaskById,
    acceptWorkTask,
    rejectWorkTask,
    startWorkTask,
    completeWorkTask,
    failWorkTask,
};