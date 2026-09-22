import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { ICreateCustomerReportPayload } from "./customerReport.interface.js";
import { CustomerReportServices } from "./customerReport.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createCustomerReport = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body as ICreateCustomerReportPayload;

        const user = req.user!;

        const result = await CustomerReportServices.createCustomerReport(
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Customer report created successfully",
            data: result,
        });
    },
);

const getMyReports = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await CustomerReportServices.getMyReports(
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer reports retrieved successfully",
            data: result,
        });
    },
);

const getAllReports = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await CustomerReportServices.getAllReports(
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer reports retrieved successfully",
            data: result,
        });
    },
);

const getReportById = catchAsync(
    async (req: Request, res: Response) => {
        const reportId = req.params.id as string;

        const user = req.user!;

        const result = await CustomerReportServices.getReportById(
            reportId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer report retrieved successfully",
            data: result,
        });
    },
);

const cancelMyReport = catchAsync(
    async (req: Request, res: Response) => {
        const reportId = req.params.id as string;

        const user = req.user!;

        const result = await CustomerReportServices.cancelMyReport(
            reportId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message:
                "Customer report cancelled successfully",
            data: result,
        });
    },
);

export const CustomerReportController = {
    createCustomerReport,
    getMyReports,
    getAllReports,
    getReportById,
    cancelMyReport,
};