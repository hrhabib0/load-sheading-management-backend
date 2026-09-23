import httpStatus from "http-status";
import { IAssignWorkTaskPayload, ICompleteWorkTaskPayload, ICreateWorkTaskPayload, IFailWorkTaskPayload, IRejectWorkTaskPayload } from "./workTask.interface.js";
import { IUserContext } from "../auth/auth.interface.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { OutageIncidentStatus, UserRole, WorkTaskStatus } from "../../../generated/prisma/enums.js";
import { Prisma } from "../../../generated/prisma/client.js";



const createWorkTask = async (
    payload: ICreateWorkTaskPayload,
    user: IUserContext,
) => {
    const incident = await prisma.outageIncident.findUnique({
        where: {
            id: payload.incidentId,
        },
        select: {
            id: true,
            status: true,
            feeder: {
                select: {
                    substation: {
                        select: {
                            zoneId: true,
                        },
                    },
                },
            },
        },
    });

    if (!incident) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Outage incident not found",
        );
    }

    if (
        incident.status !== OutageIncidentStatus.INVESTIGATING &&
        incident.status !== OutageIncidentStatus.REPAIRING
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Work task cannot be created for this incident",
        );
    }

    const zoneId = incident.feeder.substation.zoneId;

    /*
     * Check Zone Manager authorization
     */
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to create a task for this incident",
            );
        }
    }

    /*
     * Check Power Operator authorization
     */
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to create a task for this incident",
            );
        }
    }

    const task = await prisma.workTask.create({
        data: {
            incidentId: payload.incidentId,
            title: payload.title,
            description: payload.description,
            createdBy: user.userId,
            status: WorkTaskStatus.PENDING,
        },

        include: {
            incident: {
                select: {
                    id: true,
                    status: true,
                    feederId: true,
                },
            },

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return task;
};

const assignWorkTask = async (
    taskId: string,
    payload: IAssignWorkTaskPayload,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            status: true,
            incident: {
                select: {
                    feeder: {
                        select: {
                            substation: {
                                select: {
                                    zoneId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (
        task.status !== WorkTaskStatus.PENDING &&
        task.status !== WorkTaskStatus.REJECTED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only pending or rejected tasks can be assigned",
        );
    }

    const zoneId = task.incident.feeder.substation.zoneId;

    /*
     * Authorization
     */

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to assign this task",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to assign this task",
            );
        }
    }

    /*
     * Verify technician
     */

    const technician = await prisma.user.findUnique({
        where: {
            id: payload.technicianId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    if (!technician) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Technician not found",
        );
    }

    if (technician.role !== UserRole.TECHNICIAN) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Selected user is not a technician",
        );
    }

    if (!technician.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Technician is inactive",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            technicianId: payload.technicianId,
            status: WorkTaskStatus.ASSIGNED,
            assignedAt: new Date(),

            /*
             * Clear previous rejection information
             * when reassigning.
             */
            rejectionReason: null,
        },

        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return updatedTask;
};


const getAllWorkTasks = async (
    user: IUserContext,
) => {
    const where: Prisma.WorkTaskWhereInput = {};

    if (user.role !== UserRole.ADMIN) {
        let zoneIds: string[] = [];

        if (user.role === UserRole.ZONE_MANAGER) {
            const assignments = await prisma.zoneManagerAssignment.findMany({
                where: {
                    managerId: user.userId,
                },
                select: {
                    zoneId: true,
                },
            });

            zoneIds = assignments.map(
                (assignment) => assignment.zoneId,
            );
        }

        if (user.role === UserRole.POWER_OPERATOR) {
            const assignments = await prisma.operatorZoneAssignment.findMany({
                where: {
                    operatorId: user.userId,
                },
                select: {
                    zoneId: true,
                },
            });

            zoneIds = assignments.map(
                (assignment) => assignment.zoneId,
            );
        }

        if (user.role === UserRole.TECHNICIAN) {
            where.technicianId = user.userId;
        } else {
            where.incident = {
                feeder: {
                    substation: {
                        zoneId: {
                            in: zoneIds,
                        },
                    },
                },
            };
        }
    }

    const tasks = await prisma.workTask.findMany({
        where,

        orderBy: {
            createdAt: "desc",
        },

        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            incident: {
                select: {
                    id: true,
                    status: true,
                    feeder: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
        },
    });

    return tasks;
};

const getWorkTaskById = async (
    taskId: string,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },

        include: {
            technician: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            incident: {
                select: {
                    id: true,
                    status: true,
                    feeder: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

                            substation: {
                                select: {
                                    id: true,
                                    name: true,
                                    zoneId: true,

                                    zone: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    /*
     * Technician can only see their own task.
     */
    if (
        user.role === UserRole.TECHNICIAN &&
        task.technicianId !== user.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to view this task",
        );
    }

    /*
     * Admin can see everything.
     */
    if (user.role === UserRole.ADMIN) {
        return task;
    }

    const zoneId = task.incident.feeder.substation.zoneId;

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to view this task",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to view this task",
            );
        }
    }

    return task;
};

const acceptWorkTask = async (
    taskId: string,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            technicianId: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (task.technicianId !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "This task is not assigned to you",
        );
    }

    if (task.status !== WorkTaskStatus.ASSIGNED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only assigned tasks can be accepted",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: WorkTaskStatus.ACCEPTED,
            acceptedAt: new Date(),
        },
    });

    return updatedTask;
};

const rejectWorkTask = async (
    taskId: string,
    payload: IRejectWorkTaskPayload,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            technicianId: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (task.technicianId !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "This task is not assigned to you",
        );
    }

    if (task.status !== WorkTaskStatus.ASSIGNED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only assigned tasks can be rejected",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: WorkTaskStatus.REJECTED,
            rejectionReason:
                payload.rejectionReason,
        },
    });

    return updatedTask;
};

const startWorkTask = async (
    taskId: string,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            technicianId: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (task.technicianId !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "This task is not assigned to you",
        );
    }

    if (task.status !== WorkTaskStatus.ACCEPTED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only accepted tasks can be started",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: WorkTaskStatus.IN_PROGRESS,
            startedAt: new Date(),
        },
    });

    return updatedTask;
};

const completeWorkTask = async (
    taskId: string,
    payload: ICompleteWorkTaskPayload,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            technicianId: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (task.technicianId !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "This task is not assigned to you",
        );
    }

    if (task.status !== WorkTaskStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only in-progress tasks can be completed",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: WorkTaskStatus.COMPLETED,
            completedAt: new Date(),
            repairNote: payload.repairNote,
        },
    });

    return updatedTask;
};

const failWorkTask = async (
    taskId: string,
    payload: IFailWorkTaskPayload,
    user: IUserContext,
) => {
    const task = await prisma.workTask.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
            technicianId: true,
            status: true,
        },
    });

    if (!task) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Work task not found",
        );
    }

    if (task.technicianId !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "This task is not assigned to you",
        );
    }

    if (task.status !== WorkTaskStatus.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only in-progress tasks can be failed",
        );
    }

    const updatedTask = await prisma.workTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: WorkTaskStatus.FAILED,
            failureReason:
                payload.failureReason,
        },
    });

    return updatedTask;
};



export const WorkTaskServices = {
    createWorkTask,
    assignWorkTask,
    getAllWorkTasks,
    getWorkTaskById,
    acceptWorkTask,
    rejectWorkTask,
    startWorkTask,
    completeWorkTask,
    failWorkTask,
};