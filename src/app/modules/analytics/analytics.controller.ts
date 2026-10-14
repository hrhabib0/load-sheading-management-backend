import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AnalyticsServices } from "./analytics.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await AnalyticsServices.getAdminAnalytics();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin Analytics Retrieved Successfully",
        data: result,
    })
})


export const AnalyticsController = {
    getAdminAnalytics,
}