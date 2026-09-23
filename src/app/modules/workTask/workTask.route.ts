import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { WorkTaskValidation } from "./workTask.validate.js";
import { WorkTaskController } from "./workTask.controller.js";


const router = Router();


// Create Work Task
router.post(
    "/create-task",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    validateRequest(WorkTaskValidation.createWorkTaskSchema),
    WorkTaskController.createWorkTask,
);


// Get All Work Tasks
router.get(
    "/",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
        UserRole.TECHNICIAN,
    ),
    WorkTaskController.getAllWorkTasks,
);


// Get Work Task By ID
router.get(
    "/:id",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
        UserRole.TECHNICIAN,
    ),
    WorkTaskController.getWorkTaskById,
);


// Assign / Reassign Work Task
router.patch(
    "/:id/assign",
    auth(
        UserRole.ADMIN,
        UserRole.POWER_OPERATOR,
        UserRole.ZONE_MANAGER,
    ),
    validateRequest(WorkTaskValidation.assignWorkTaskSchema),
    WorkTaskController.assignWorkTask,
);


// Accept Work Task
router.patch(
    "/:id/accept",
    auth(UserRole.TECHNICIAN),
    WorkTaskController.acceptWorkTask,
);


// Reject Work Task
router.patch(
    "/:id/reject",
    auth(UserRole.TECHNICIAN),
    validateRequest(WorkTaskValidation.rejectWorkTaskSchema),
    WorkTaskController.rejectWorkTask,
);


// Start Work Task
router.patch(
    "/:id/start",
    auth(UserRole.TECHNICIAN),
    WorkTaskController.startWorkTask,
);


// Complete Work Task
router.patch(
    "/:id/complete",
    auth(UserRole.TECHNICIAN),
    validateRequest(WorkTaskValidation.completeWorkTaskSchema),
    WorkTaskController.completeWorkTask,
);


// Fail Work Task
router.patch(
    "/:id/fail",
    auth(UserRole.TECHNICIAN),
    validateRequest(WorkTaskValidation.failWorkTaskSchema),
    WorkTaskController.failWorkTask,
);


export const WorkTaskRoutes = router;