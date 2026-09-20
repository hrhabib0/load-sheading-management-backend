import { NotificationType } from "../../../generated/prisma/enums.js";

export interface ICreateNotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
}