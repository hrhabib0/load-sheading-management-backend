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

const getAllZones = catchAsync(async (_req: Request, res: Response) => {
  const result = await ZoneServices.getAllZones();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Zones retrieved successfully",
    data: result
  })
});

const getZoneById = catchAsync(async (req: Request, res: Response) => {
  const result = await ZoneServices.getZoneById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Zoness retrieved successfully",
    data: result
  })
});

const updateZone = catchAsync(async (req: Request, res: Response) => {
  const result = await ZoneServices.updateZone(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Zone updated successfully",
    data: result
  })
});

const updateZoneStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ZoneServices.updateZoneStatus(
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.isActive
        ? "Zone activated successfully"
        : "Zone deactivated successfully",
      data: result
    })
  },
);

export const ZoneController = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  updateZoneStatus,
};