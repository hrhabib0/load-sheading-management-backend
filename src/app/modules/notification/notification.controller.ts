import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { NotificationServices } from "./notification.service.js";


const createNotification = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await NotificationServices.createNotification(payload);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Notification created successfully",
            data: result,
        });
    },
);

const getMyNotifications = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await NotificationServices.getMyNotifications(
            user.userId,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Notifications retrieved successfully",
            data: result,
        });
    },
);

const markNotificationAsRead = catchAsync(
    async (req: Request, res: Response) => {
        const notificationId = req.params.id as string;
        const user = req.user!;

        const result = await NotificationServices.markNotificationAsRead(
            notificationId,
            user.userId,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Notification marked as read successfully",
            data: result,
        });
    },
);

const markAllNotificationsAsRead = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;

        const result = await NotificationServices.markAllNotificationsAsRead(
            user.userId,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "All notifications marked as read successfully",
            data: result,
        });
    },
);

export const NotificationController = {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};