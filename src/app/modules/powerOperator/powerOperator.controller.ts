import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { powerOperatorServices } from "./powerOperator.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { Request, Response } from "express";


const getAllPowerOperators = catchAsync(async (req: Request, res: Response) => {
    const result = await powerOperatorServices.getAllPowerOperators();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Power operators retrieved successfully",
        data: result
    });
});

export const powerOperatorController = {
    getAllPowerOperators
};