import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { SubstationServices } from "./substation.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createSubstation = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user!
        const result = await SubstationServices.createSubstation(payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Substation created successfully",
            data: result,
        })
    },
);

const getAllSubstations = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!
        const result = await SubstationServices.getAllSubstations(user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Substations retrieved successfully",
            data: result,
        })
    },
);

const getSubstationById = catchAsync(
    async (req: Request, res: Response) => {
        const substationId = req.params.id as string;
        const user = req.user!;
        const result = await SubstationServices.getSubstationById(substationId, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Substation retrieved successfully",
            data: result,
        })
    },
);

const updateSubstation = catchAsync(
    async (req: Request, res: Response) => {
        const substationId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;
        const result = await SubstationServices.updateSubstation(substationId, payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Substation updated successfully",
            data: result,
        })
    },
);

const updateSubstationStatus = catchAsync(
    async (req: Request, res: Response) => {
        const substationId = req.params.id as string;
        const payload = req.body;
        const user = req.user!;
        const result = await SubstationServices.updateSubstationStatus(substationId, payload, user);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: result.isActive
                ? "Substation activated successfully"
                : "Substation deactivated successfully",
            data: result,
        })
    },
);

export const SubstationController = {
    createSubstation,
    getAllSubstations,
    getSubstationById,
    updateSubstation,
    updateSubstationStatus,
};