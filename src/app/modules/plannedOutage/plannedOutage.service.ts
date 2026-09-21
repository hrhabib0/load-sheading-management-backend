import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { ICancelPlannedOutagePayload, ICreatePlannedOutagePayload, IUpdatePlannedOutagePayload } from "./plannedOutage.interface.js";
import httpStatus from "http-status";
import { PlannedOutageStatus, UserRole } from "../../../generated/prisma/enums.js";
import { Prisma } from "../../../generated/prisma/client.js";


interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const createPlannedOutage = async (
    payload: ICreatePlannedOutagePayload,
    userId: string,
) => {
    const {
        title,
        description,
        scheduledStartAt,
        scheduledEndAt,
        feederIds,
    } = payload;

    if (!feederIds || feederIds.length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "At least one feeder is required",
        );
    }

    if (new Date(scheduledStartAt) >= new Date(scheduledEndAt)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Scheduled start time must be before scheduled end time",
        );
    }

    // Remove duplicate feeder IDs
    const uniqueFeederIds = [...new Set(feederIds)];

    // Check all feeders exist
    const feeders = await prisma.feeder.findMany({
        where: {
            id: {
                in: uniqueFeederIds,
            },
        },
        select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
            substation: {
                select: {
                    id: true,
                    name: true,
                    zoneId: true,
                },
            },
        },
    });

    if (feeders.length !== uniqueFeederIds.length) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "One or more feeders were not found",
        );
    }

    // Inactive feeders cannot be selected
    const inactiveFeeders = feeders.filter(
        (feeder) => !feeder.isActive,
    );

    if (inactiveFeeders.length > 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create planned outage for an inactive feeder",
        );
    }

    // Check overlapping planned outages
    const overlappingOutage = await prisma.plannedOutage.findFirst({
        where: {
            status: {
                notIn: ["CANCELLED", "COMPLETED"],
            },

            scheduledStartAt: {
                lt: new Date(scheduledEndAt),
            },

            scheduledEndAt: {
                gt: new Date(scheduledStartAt),
            },

            feeders: {
                some: {
                    feederId: {
                        in: uniqueFeederIds,
                    },
                },
            },
        },
        select: {
            id: true,
            title: true,
            scheduledStartAt: true,
            scheduledEndAt: true,
        },
    });

    if (overlappingOutage) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `A planned outage already exists for one of the selected feeders during this time`,
        );
    }

    const plannedOutage = await prisma.plannedOutage.create({
        data: {
            title,
            description,
            scheduledStartAt: new Date(
                scheduledStartAt,
            ),
            scheduledEndAt: new Date(
                scheduledEndAt,
            ),
            createdBy: userId,

            feeders: {
                create: uniqueFeederIds.map(
                    (feederId) => ({
                        feederId,
                    }),
                ),
            },
        },

        include: {
            feeders: {
                include: {
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
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return plannedOutage;
};

const getAllPlannedOutages = async (
    user: IUserContext,
) => {
    const where: Prisma.PlannedOutageWhereInput = {};

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

        where.feeders = {
            some: {
                feeder: {
                    substation: {
                        zoneId: {
                            in: zoneIds,
                        },
                    },
                },
            },
        };
    }

    const plannedOutages = await prisma.plannedOutage.findMany({
        where,

        orderBy: {
            createdAt: "desc",
        },

        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            approver: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            feeders: {
                include: {
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

    return plannedOutages;
};

const getPlannedOutageById = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },

        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            approver: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            feeders: {
                include: {
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

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    // Admin can view everything.
    if (user.role === UserRole.ADMIN) {
        return plannedOutage;
    }

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) =>
                    item.feeder.substation.zoneId,
            ),
        ),
    ];

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment =
            await prisma.zoneManagerAssignment.findFirst({
                where: {
                    managerId: user.userId,
                    zoneId: {
                        in: zoneIds,
                    },
                },
            });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this planned outage's zone",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this planned outage's zone",
            );
        }
    }

    return plannedOutage;
};

const updatePlannedOutage = async (
    plannedOutageId: string,
    payload: IUpdatePlannedOutagePayload,
    user: IUserContext,
) => {
    const existingOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
                select: {
                    feederId: true,
                },
            },
        },
    });

    if (!existingOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    // Only DRAFT can be edited
    if (existingOutage.status !== PlannedOutageStatus.DRAFT) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only draft planned outages can be updated",
        );
    }

    /*
     * Check zone authorization.
     * Admin can update any outage.
     */
    if (user.role !== UserRole.ADMIN) {
        const existingZoneIds = await prisma.plannedOutageFeeder.findMany({
            where: {
                plannedOutageId,
            },
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
        });

        const zoneIds = [
            ...new Set(
                existingZoneIds.map(
                    (item) =>
                        item.feeder.substation.zoneId,
                ),
            ),
        ];

        let hasAccess = false;

        if (user.role === UserRole.ZONE_MANAGER) {
            const assignment = await prisma.zoneManagerAssignment.findFirst({
                where: {
                    managerId: user.userId,
                    zoneId: {
                        in: zoneIds,
                    },
                },
            });

            hasAccess = !!assignment;
        }

        if (user.role === UserRole.POWER_OPERATOR) {
            const assignment = await prisma.operatorZoneAssignment.findFirst({
                where: {
                    operatorId: user.userId,
                    zoneId: {
                        in: zoneIds,
                    },
                },
            });

            hasAccess = !!assignment;
        }

        if (!hasAccess) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to update this planned outage",
            );
        }
    }

    const startDate = payload.scheduledStartAt
        ? new Date(payload.scheduledStartAt)
        : existingOutage.scheduledStartAt;

    const endDate = payload.scheduledEndAt
        ? new Date(payload.scheduledEndAt)
        : existingOutage.scheduledEndAt;

    if (startDate >= endDate) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Scheduled start time must be before scheduled end time",
        );
    }

    /*
     * If feederIds are supplied, validate them.
     */
    let uniqueFeederIds =
        existingOutage.feeders.map(
            (item) => item.feederId,
        );

    if (payload.feederIds) {
        if (payload.feederIds.length === 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "At least one feeder is required",
            );
        }

        uniqueFeederIds = [
            ...new Set(payload.feederIds),
        ];

        const feeders = await prisma.feeder.findMany({
            where: {
                id: {
                    in: uniqueFeederIds,
                },
            },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (
            feeders.length !==
            uniqueFeederIds.length
        ) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "One or more feeders were not found",
            );
        }

        const hasInactiveFeeder =
            feeders.some(
                (feeder) => !feeder.isActive,
            );

        if (hasInactiveFeeder) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Cannot use an inactive feeder",
            );
        }
    }

    /*
     * Check overlapping outages.
     */
    const overlappingOutage = await prisma.plannedOutage.findFirst({
        where: {
            id: {
                not: plannedOutageId,
            },

            status: {
                notIn: [
                    "CANCELLED",
                    "COMPLETED",
                ],
            },

            scheduledStartAt: {
                lt: endDate,
            },

            scheduledEndAt: {
                gt: startDate,
            },

            feeders: {
                some: {
                    feederId: {
                        in: uniqueFeederIds,
                    },
                },
            },
        },
    });

    if (overlappingOutage) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Another planned outage already exists for one of the selected feeders during this time",
        );
    }

    /*
     * Update everything inside one transaction.
     */
    const updatedOutage = await prisma.$transaction(
        async (tx) => {
            if (payload.feederIds) {
                await tx.plannedOutageFeeder.deleteMany({
                    where: {
                        plannedOutageId,
                    },
                });

                await tx.plannedOutageFeeder.createMany({
                    data: uniqueFeederIds.map(
                        (feederId) => ({
                            plannedOutageId,
                            feederId,
                        }),
                    ),
                });
            }

            return tx.plannedOutage.update({
                where: {
                    id: plannedOutageId,
                },
                data: {
                    ...(payload.title !== undefined && {
                        title: payload.title,
                    }),

                    ...(payload.description !== undefined && {
                        description:
                            payload.description,
                    }),

                    scheduledStartAt: startDate,
                    scheduledEndAt: endDate,
                },
                include: {
                    feeders: {
                        include: {
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
        },
    );

    return updatedOutage;
};

const submitPlannedOutageForApproval = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
                select: {
                    feederId: true,
                },
            },
        },
    });

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    if (plannedOutage.status !== "DRAFT") {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only draft planned outages can be submitted for approval",
        );
    }

    // The creator can only submit their own outage.
    if (plannedOutage.createdBy !== user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Only the creator can submit this planned outage for approval",
        );
    }

    if (plannedOutage.feeders.length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "At least one feeder is required before submitting for approval",
        );
    }

    const updatedOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.PENDING_APPROVAL,
        },
    });

    return updatedOutage;
};

const approvePlannedOutage = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
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

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    if (
        plannedOutage.status !==
        PlannedOutageStatus.PENDING_APPROVAL
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only planned outages pending approval can be approved",
        );
    }

    // Creator cannot approve their own outage
    if (
        plannedOutage.createdBy === user.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "The creator cannot approve their own planned outage",
        );
    }

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) =>
                    item.feeder.substation.zoneId,
            ),
        ),
    ];

    /*
     * ADMIN can approve any planned outage.
     */

    /*
     * ZONE_MANAGER must belong to
     * one of the affected zones.
     */
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    /*
     * POWER_OPERATOR must belong to
     * one of the affected zones.
     */
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    const approvedOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.APPROVED,
            approvedBy: user.userId,
            approvedAt: new Date(),
        },
    });

    return approvedOutage;
};

const publishPlannedOutage = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
                select: {
                    feederId: true,
                },
            },
        },
    });

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    // Only APPROVED outages can be published
    if (plannedOutage.status !== PlannedOutageStatus.APPROVED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only approved planned outages can be published",
        );
    }

    if (plannedOutage.feeders.length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "A planned outage must have at least one feeder",
        );
    }

    const feederIds = plannedOutage.feeders.map(
        (item) => item.feederId,
    );

    /*
     * Find the zones affected by this outage.
     */
    const feeders = await prisma.feeder.findMany({
        where: {
            id: {
                in: feederIds,
            },
        },
        select: {
            id: true,
            substation: {
                select: {
                    zoneId: true,
                },
            },
        },
    });

    const zoneIds = [
        ...new Set(
            feeders.map(
                (feeder) =>
                    feeder.substation.zoneId,
            ),
        ),
    ];

    /*
     * Authorization
     */

    // ADMIN can publish any approved outage.

    // ZONE_MANAGER
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    // POWER_OPERATOR
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    /*
     * Find customers affected by the selected feeders.
     */
    const customers = await prisma.customerProfile.findMany({
        where: {
            area: {
                feederId: {
                    in: feederIds,
                },
            },
        },
        select: {
            userId: true,
            area: {
                select: {
                    name: true,
                },
            },
        },
    });

    /*
     * Publish outage + create notifications
     * in one transaction.
     */
    const result = await prisma.$transaction(
        async (tx) => {
            const publishedOutage = await tx.plannedOutage.update({
                where: {
                    id: plannedOutageId,
                },
                data: {
                    status: PlannedOutageStatus.PUBLISHED,
                    publishedAt: new Date(),
                },
            });

            if (customers.length > 0) {
                await tx.notification.createMany({
                    data: customers.map(
                        (customer) => ({
                            userId: customer.userId,
                            title: "Planned Power Outage",
                            message:
                                `A planned power outage has been scheduled for your area (${customer.area.name}). ` +
                                `Scheduled from ${plannedOutage.scheduledStartAt.toISOString()} ` +
                                `to ${plannedOutage.scheduledEndAt.toISOString()}.`,
                            type:
                                "PLANNED_OUTAGE_PUBLISHED",
                        }),
                    ),
                });
            }

            return publishedOutage;
        },
    );

    return result;
};

const startPlannedOutage = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
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

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    if (plannedOutage.status !== PlannedOutageStatus.PUBLISHED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only published planned outages can be started",
        );
    }

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) =>
                    item.feeder.substation.zoneId,
            ),
        ),
    ];

    /*
     * ADMIN can start any planned outage.
     */

    /*
     * ZONE_MANAGER
     */
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment =
            await prisma.zoneManagerAssignment.findFirst({
                where: {
                    managerId: user.userId,
                    zoneId: {
                        in: zoneIds,
                    },
                },
            });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    /*
     * POWER_OPERATOR
     */
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    const startedOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.IN_PROGRESS,
            actualStartAt: new Date(),
        },
    });

    return startedOutage;
};

const completePlannedOutage = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
                include: {
                    feeder: {
                        include: {
                            substation: true,
                        },
                    },
                },
            },
        },
    });

    if (!plannedOutage) {
        throw new AppError(httpStatus.NOT_FOUND, "Planned outage not found");
    }

    if (plannedOutage.status !== "IN_PROGRESS") {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only an in-progress planned outage can be completed",
        );
    }

    // ADMIN can complete any planned outage

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) => item.feeder.substation.zoneId,
            ),
        ),
    ];

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to complete this planned outage",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to complete this planned outage",
            );
        }
    }

    const completedPlannedOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.COMPLETED,
            actualEndAt: new Date(),
        },
        include: {
            feeders: {
                include: {
                    feeder: true,
                },
            },
        },
    });

    return completedPlannedOutage;
};

const rejectPlannedOutage = async (
    plannedOutageId: string,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
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

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    if (
        plannedOutage.status !==
        PlannedOutageStatus.PENDING_APPROVAL
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only planned outages pending approval can be rejected",
        );
    }

    // Creator cannot reject their own outage.
    if (plannedOutage.createdBy === user.userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "The creator cannot reject their own planned outage",
        );
    }

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) =>
                    item.feeder.substation.zoneId,
            ),
        ),
    ];

    // ZONE_MANAGER
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    // POWER_OPERATOR
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    const rejectedOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.REJECTED,
        },
    });

    return rejectedOutage;
};

const cancelPlannedOutage = async (
    plannedOutageId: string,
    payload: ICancelPlannedOutagePayload,
    user: IUserContext,
) => {
    const plannedOutage = await prisma.plannedOutage.findUnique({
        where: {
            id: plannedOutageId,
        },
        include: {
            feeders: {
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

    if (!plannedOutage) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Planned outage not found",
        );
    }

    const cancellableStatuses = [
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "PUBLISHED",
    ];

    if (
        !cancellableStatuses.includes(
            plannedOutage.status,
        )
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Planned outage cannot be cancelled from ${plannedOutage.status} status`,
        );
    }

    const zoneIds = [
        ...new Set(
            plannedOutage.feeders.map(
                (item) =>
                    item.feeder.substation.zoneId,
            ),
        ),
    ];

    // ZONE_MANAGER
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    // POWER_OPERATOR
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: {
                    in: zoneIds,
                },
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to any zone affected by this planned outage",
            );
        }
    }

    const cancelledOutage = await prisma.plannedOutage.update({
        where: {
            id: plannedOutageId,
        },
        data: {
            status: PlannedOutageStatus.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: payload.cancellationReason,
        },
    });

    return cancelledOutage;
};


export const PlannedOutageServices = {
    createPlannedOutage,
    getAllPlannedOutages,
    getPlannedOutageById,
    updatePlannedOutage,
    submitPlannedOutageForApproval,
    approvePlannedOutage,
    publishPlannedOutage,
    startPlannedOutage,
    completePlannedOutage,
    rejectPlannedOutage,
    cancelPlannedOutage,
};