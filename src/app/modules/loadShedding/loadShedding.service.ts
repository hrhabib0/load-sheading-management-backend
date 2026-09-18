import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { LoadSheddingScheduleStatus, UserRole } from "../../../generated/prisma/enums.js";
import httpStatus from "http-status";
import { ICreateLoadSheddingSchedulePayload, IUpdateLoadSheddingSchedulePayload } from "./loadShedding.interface.js";


interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const validateFeeders = async (
    feederIds: string[],
    user: IUserContext,
) => {
    const feeders = await prisma.feeder.findMany({
        where: {
            id: {
                in: feederIds,
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
                    code: true,
                    zoneId: true,
                },
            },
        },
    });

    if (feeders.length !== feederIds.length) {
        throw new AppError(httpStatus.NOT_FOUND, "One or more feeders not found");
    }

    const inactiveFeeder = feeders.find(
        (feeder) => !feeder.isActive,
    );

    if (inactiveFeeder) {
        throw new AppError(
            httpStatus.CONFLICT,
            `Feeder ${inactiveFeeder.name} is inactive`,
        );
    }

    // All feeders must belong to the same Zone.
    const zoneIds = new Set(
        feeders.map((feeder) => feeder.substation.zoneId),
    );

    if (zoneIds.size > 1) {
        throw new AppError(
            400,
            "All feeders in a load-shedding schedule must belong to the same zone",
        );
    }

    const zoneId = feeders[0].substation.zoneId;

    // Zone Manager authorization
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment =
            await prisma.zoneManagerAssignment.findFirst({
                where: {
                    managerId: user.userId,
                    zoneId,
                },
            });

        if (!assignment) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not assigned to this zone",
            );
        }
    }

    // Power Operator authorization
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment =
            await prisma.operatorZoneAssignment.findFirst({
                where: {
                    operatorId: user.userId,
                    zoneId,
                },
            });

        if (!assignment) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not assigned to this zone",
            );
        }
    }

    return feeders;
};


const checkOverlappingSchedule = async (
    feederIds: string[],
    scheduledStartAt: Date,
    scheduledEndAt: Date,
    excludeScheduleId?: string,
) => {
    const existingSchedule =
        await prisma.loadSheddingSchedule.findFirst({
            where: {
                ...(excludeScheduleId && {
                    id: {
                        not: excludeScheduleId,
                    },
                }),

                status: {
                    not: "CANCELLED",
                },

                scheduledStartAt: {
                    lt: scheduledEndAt,
                },

                scheduledEndAt: {
                    gt: scheduledStartAt,
                },

                feeders: {
                    some: {
                        feederId: {
                            in: feederIds,
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

    if (existingSchedule) {
        throw new AppError(
            httpStatus.CONFLICT,
            `Schedule overlaps with existing schedule: ${existingSchedule.title}`,
        );
    }
};


const createLoadSheddingSchedule = async (
    payload: ICreateLoadSheddingSchedulePayload,
    user: IUserContext,
) => {
    const {
        title,
        description,
        requiredReduction,
        scheduledStartAt,
        scheduledEndAt,
        feederIds,
    } = payload;

    // Remove duplicate feeder IDs.
    const uniqueFeederIds = [...new Set(feederIds)];

    if (uniqueFeederIds.length !== feederIds.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Duplicate feeder IDs are not allowed",
        );
    }

    await validateFeeders(uniqueFeederIds, user);

    await checkOverlappingSchedule(
        uniqueFeederIds,
        scheduledStartAt,
        scheduledEndAt,
    );

    const schedule = await prisma.loadSheddingSchedule.create({
        data: {
            title,
            description,
            requiredReduction,
            scheduledStartAt,
            scheduledEndAt,
            createdBy: user.userId,
            status: LoadSheddingScheduleStatus.DRAFT,

            feeders: {
                create: uniqueFeederIds.map((feederId) => ({
                    feederId,
                })),
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
                        },
                    },
                },
            },
        },
    });

    return schedule;
};


const getAllLoadSheddingSchedules = async (
    user: IUserContext,
) => {
    const schedules =
        await prisma.loadSheddingSchedule.findMany({
            where: {
                ...(user.role === UserRole.ZONE_MANAGER && {
                    feeders: {
                        some: {
                            feeder: {
                                substation: {
                                    zone: {
                                        managerAssignment: {
                                            managerId: user.userId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),

                ...(user.role === UserRole.POWER_OPERATOR && {
                    feeders: {
                        some: {
                            feeder: {
                                substation: {
                                    zone: {
                                        operatorAssignments: {
                                            some: {
                                                operatorId: user.userId,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            },

            orderBy: {
                scheduledStartAt: "desc",
            },

            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

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

    return schedules;
};


const getLoadSheddingScheduleById = async (
    scheduleId: string,
    user: IUserContext,
) => {
    const schedule =
        await prisma.loadSheddingSchedule.findUnique({
            where: {
                id: scheduleId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
                                        code: true,
                                        zoneId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!schedule) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Load-shedding schedule not found",
        );
    }

    // Admin can access everything.
    if (user.role === UserRole.ADMIN) {
        return schedule;
    }

    const zoneIds = new Set(
        schedule.feeders.map(
            (item) => item.feeder.substation.zoneId,
        ),
    );

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignments =
            await prisma.zoneManagerAssignment.findMany({
                where: {
                    managerId: user.userId,
                    zoneId: {
                        in: [...zoneIds],
                    },
                },
            });

        if (assignments.length !== zoneIds.size) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not assigned to this schedule's zone",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignments =
            await prisma.operatorZoneAssignment.findMany({
                where: {
                    operatorId: user.userId,
                    zoneId: {
                        in: [...zoneIds],
                    },
                },
            });

        if (assignments.length !== zoneIds.size) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not assigned to this schedule's zone",
            );
        }
    }

    return schedule;
};


const updateLoadSheddingSchedule = async (
    scheduleId: string,
    payload: IUpdateLoadSheddingSchedulePayload,
    user: IUserContext,
) => {
    const schedule =
        await prisma.loadSheddingSchedule.findUnique({
            where: {
                id: scheduleId,
            },
            include: {
                feeders: {
                    select: {
                        feederId: true,
                    },
                },
            },
        });

    if (!schedule) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Load-shedding schedule not found",
        );
    }

    if (
        schedule.status !== LoadSheddingScheduleStatus.DRAFT
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only draft schedules can be updated",
        );
    }

    // Verify creator/zone permission.
    await getLoadSheddingScheduleById(
        scheduleId,
        user,
    );

    const newFeederIds =
        payload.feederIds ??
        schedule.feeders.map((item) => item.feederId);

    const uniqueFeederIds = [
        ...new Set(newFeederIds),
    ];

    if (uniqueFeederIds.length !== newFeederIds.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Duplicate feeder IDs are not allowed",
        );
    }

    await validateFeeders(
        uniqueFeederIds,
        user,
    );

    const startAt =
        payload.scheduledStartAt ??
        schedule.scheduledStartAt;

    const endAt =
        payload.scheduledEndAt ??
        schedule.scheduledEndAt;

    if (endAt <= startAt) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Scheduled end time must be after start time",
        );
    }

    await checkOverlappingSchedule(
        uniqueFeederIds,
        startAt,
        endAt,
        scheduleId,
    );

    const updatedSchedule =
        await prisma.$transaction(async (tx) => {
            const updated =
                await tx.loadSheddingSchedule.update({
                    where: {
                        id: scheduleId,
                    },
                    data: {
                        ...(payload.title !== undefined && {
                            title: payload.title,
                        }),

                        ...(payload.description !== undefined && {
                            description:
                                payload.description,
                        }),

                        ...(payload.requiredReduction !==
                            undefined && {
                            requiredReduction:
                                payload.requiredReduction,
                        }),

                        ...(payload.scheduledStartAt !==
                            undefined && {
                            scheduledStartAt:
                                payload.scheduledStartAt,
                        }),

                        ...(payload.scheduledEndAt !==
                            undefined && {
                            scheduledEndAt:
                                payload.scheduledEndAt,
                        }),
                    },
                });

            if (payload.feederIds) {
                await tx.loadSheddingFeeder.deleteMany({
                    where: {
                        scheduleId,
                    },
                });

                await tx.loadSheddingFeeder.createMany({
                    data: uniqueFeederIds.map(
                        (feederId) => ({
                            scheduleId,
                            feederId,
                        }),
                    ),
                });
            }

            return updated;
        });

    return updatedSchedule;
};


export const LoadSheddingServices = {
    createLoadSheddingSchedule,
    getAllLoadSheddingSchedules,
    getLoadSheddingScheduleById,
    updateLoadSheddingSchedule,
};