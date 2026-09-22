import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { ICreateOutageIncidentPayload } from "./outageIncident.interface.js";
import { OutageIncidentServices } from "./outageIncident.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createOutageIncident = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body as ICreateOutageIncidentPayload;

        const user = req.user!;

        const result = await OutageIncidentServices.createOutageIncident(
            payload,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Outage incident created successfully",
            data: result,
        });
    },
);

const getAllOutageIncidents = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await OutageIncidentServices.getAllOutageIncidents(
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Outage incidents retrieved successfully",
            data: result,
        });
    },
);

const getOutageIncidentById = catchAsync(
    async (req: Request, res: Response) => {
        const incidentId = req.params.id as string;

        const user = req.user!;

        const result = await OutageIncidentServices.getOutageIncidentById(
            incidentId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Outage incident retrieved successfully",
            data: result,
        });
    },
);

const linkCustomerReport = catchAsync(
    async (req: Request, res: Response) => {
        const incidentId = req.params.id as string;

        const { reportId } = req.body;

        const user = req.user!;

        const result = await OutageIncidentServices.linkCustomerReport(
            incidentId,
            reportId,
            user,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Customer report linked successfully",
            data: result,
        });
    },
);

export const OutageIncidentController = {
    createOutageIncident,
    getAllOutageIncidents,
    getOutageIncidentById,
    linkCustomerReport,
};