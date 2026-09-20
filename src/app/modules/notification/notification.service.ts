import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import {
    ICreateNotificationPayload,
} from "./notification.interface.js";
import httpStatus from "http-status";

const createNotification = async (payload: ICreateNotificationPayload) => {
    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
        select: {
            id: true,
            isActive: true,
        },
    });

    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found",
        );
    }

    if (!user.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create notification for an inactive user",
        );
    }

    const notification = await prisma.notification.create({
        data: {
            userId: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
        },
    });

    return notification;
};

const getMyNotifications = async (userId: string) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications;
};

const markNotificationAsRead = async (
    notificationId: string,
    userId: string,
) => {
    const notification = await prisma.notification.findUnique({
        where: {
            id: notificationId,
        },
    });

    if (!notification) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Notification not found",
        );
    }

    if (notification.userId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to access this notification",
        );
    }

    if (notification.isRead) {
        return notification;
    }

    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return updatedNotification;
};

const markAllNotificationsAsRead = async (
    userId: string,
) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return {
        updatedCount: result.count,
    };
};

export const NotificationServices = {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};