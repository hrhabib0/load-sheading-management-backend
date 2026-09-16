import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { ZoneServices } from "./zone.service.js";
import { sendResponse } from "../../utils/sendResponse.js";


const createZone = catchAsync(async (req: Request, res: Response) => {
  const result = await ZoneServices.createZone(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Zone created successfully",
    data: result
  })
});

export const ZoneController = {
  createZone,
};