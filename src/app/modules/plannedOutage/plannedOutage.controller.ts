import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { PlannedOutageServices } from "./plannedOutage.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createPlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!;

        const result = await PlannedOutageServices.createPlannedOutage(
            payload,
            user.userId,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Planned outage created successfully",
            data: result,
        });
    },
);

const getAllPlannedOutages = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await PlannedOutageServices.getAllPlannedOutages(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outages retrieved successfully",
            data: result,
        });
    },
);

const getPlannedOutageById = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.getPlannedOutageById(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage retrieved successfully",
            data: result,
        });
    },
);

const updatePlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const payload = req.body;
        const user = req.user!;

        const result = await PlannedOutageServices.updatePlannedOutage(
            plannedOutageId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage updated successfully",
            data: result,
        });
    },
);

const submitPlannedOutageForApproval = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.submitPlannedOutageForApproval(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage submitted for approval successfully",
            data: result,
        });
    },
);

const approvePlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.approvePlannedOutage(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage approved successfully",
            data: result,
        });
    },
);

const publishPlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.publishPlannedOutage(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage published successfully",
            data: result,
        });
    },
);

const startPlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.startPlannedOutage(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage started successfully",
            data: result,
        });
    },
);

const completePlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;
        const user = req.user!;

        const result = await PlannedOutageServices.completePlannedOutage(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage completed successfully",
            data: result,
        });
    },
);

const rejectPlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const user = req.user!;

        const result = await PlannedOutageServices.rejectPlannedOutage(
            plannedOutageId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage rejected successfully",
            data: result,
        });
    },
);

const cancelPlannedOutage = catchAsync(
    async (req: Request, res: Response) => {
        const plannedOutageId = req.params.id as string;

        const payload = req.body;

        const user = req.user!;

        const result = await PlannedOutageServices.cancelPlannedOutage(
            plannedOutageId,
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Planned outage cancelled successfully",
            data: result,
        });
    },
);

export const PlannedOutageController = {
    createPlannedOutage,
    getAllPlannedOutages,
    getPlannedOutageById,
    updatePlannedOutage,
    submitPlannedOutageForApproval,
    approvePlannedOutage,
    publishPlannedOutage,
    startPlannedOutage,
    completePlannedOutage,
    rejectPlannedOutage,
    cancelPlannedOutage,
};