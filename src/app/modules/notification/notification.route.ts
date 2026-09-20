import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";


const router = Router();

router.post(
    "/create-notification",
    auth(UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    NotificationController.createNotification,
);

router.get(
    "/my-notifications",
    auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.ZONE_MANAGER, UserRole.POWER_OPERATOR),
    NotificationController.getMyNotifications,
);

router.patch(
    "/read-all",
    auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.POWER_OPERATOR, UserRole.TECHNICIAN, UserRole.ZONE_MANAGER),
    NotificationController.markAllNotificationsAsRead,
);

router.patch(
    "/:id/read",
    auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.POWER_OPERATOR, UserRole.TECHNICIAN, UserRole.ZONE_MANAGER),
    NotificationController.markNotificationAsRead,
);


export const NotificationRoutes = router;