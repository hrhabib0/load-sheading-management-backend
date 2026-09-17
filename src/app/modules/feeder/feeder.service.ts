import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import {
    ICreateFeederPayload,
    IUpdateFeederPayload,
    IUpdateFeederStatusPayload,
} from "./feeder.interface.js";
import { UserRole } from "../../../generated/prisma/enums.js";


interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const createFeeder = async (
    payload: ICreateFeederPayload,
    user: IUserContext,
) => {
    const { substationId, name, code, description } = payload;

    // 1. Check whether the Substation exists
    const substation = await prisma.substation.findUnique({
        where: {
            id: substationId,
        },
    });

    if (!substation) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Substation not found",
        );
    }

    // 2. Cannot create feeder under inactive Substation
    if (!substation.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create a feeder under an inactive substation",
        );
    }

    // 3. Zone Manager can only manage their assigned Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    // 4. Check duplicate feeder code
    const existingFeeder = await prisma.feeder.findUnique({
        where: {
            code,
        },
    });

    if (existingFeeder) {
        throw new AppError(
            httpStatus.CONFLICT,
            "A feeder already exists with this code",
        );
    }

    // 5. Create Feeder
    const feeder = await prisma.feeder.create({
        data: {
            substationId,
            name,
            code,
            description,
        },
    });

    return feeder;
};

const getAllFeeders = async (user: IUserContext) => {
    // Admin can see everything
    if (user.role === UserRole.ADMIN) {
        const feeders = prisma.feeder.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return feeders;
    }

    // Zone Manager and Power Operator
    // can only see feeders inside their assigned Zones
    if (
        user.role === UserRole.ZONE_MANAGER ||
        user.role === UserRole.POWER_OPERATOR
    ) {
        const feeders = await prisma.feeder.findMany({
            where: {
                substation: {
                    zone: {
                        OR: [
                            {
                                managerAssignment: {
                                    managerId: user.userId,
                                },
                            },
                            {
                                operatorAssignments: {
                                    some: {
                                        operatorId: user.userId,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return feeders;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view feeders",
    );
};

const getFeederById = async (
    id: string,
    user: IUserContext,
) => {
    // 1. Find feeder
    const feeder = await prisma.feeder.findUnique({
        where: {
            id,
        },
        include: {
            substation: true
        }
    });

    if (!feeder) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Feeder not found",
        );
    }

    // 2. Admin can access everything
    if (user.role === UserRole.ADMIN) {
        return feeder;
    }

    // 3. Zone Manager / Power Operator
    // must have access to the feeder's Zone
    if (
        user.role === UserRole.ZONE_MANAGER ||
        user.role === UserRole.POWER_OPERATOR
    ) {
        const hasAccess = await prisma.zone.findFirst({
            where: {
                id: feeder.substation.zoneId,
                OR: [
                    {
                        managerAssignment: {
                            managerId: user.userId,
                        },
                    },
                    {
                        operatorAssignments: {
                            some: {
                                operatorId: user.userId,
                            },
                        },
                    },
                ],
            },
        });

        if (!hasAccess) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to access this feeder",
            );
        }

        return feeder;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view this feeder",
    );
};

const updateFeeder = async (
    id: string,
    payload: IUpdateFeederPayload,
    user: IUserContext,
) => {
    // 1. Find feeder
    const existingFeeder = await prisma.feeder.findUnique({
        where: {
            id,
        },
        include: {
            substation: true,
        }
    });

    if (!existingFeeder) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Feeder not found",
        );
    }

    // 2. Only Admin and Zone Manager can update
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this feeder",
        );
    }

    // 3. Zone Manager must belong to feeder's Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingFeeder.substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    // 4. Check duplicate code
    if (payload.code) {
        const duplicateFeeder = await prisma.feeder.findFirst({
            where: {
                code: payload.code,
                NOT: {
                    id,
                },
            },
        });

        if (duplicateFeeder) {
            throw new AppError(
                httpStatus.CONFLICT,
                "A feeder already exists with this code",
            );
        }
    }

    // 5. Update
    const feeder = await prisma.feeder.update({
        where: {
            id,
        },
        data: payload,
    });

    return feeder;
};

const updateFeederStatus = async (
    id: string,
    payload: IUpdateFeederStatusPayload,
    user: IUserContext,
) => {
    // 1. Find feeder
    const existingFeeder = await prisma.feeder.findUnique({
        where: {
            id,
        },
        include: {
            substation: true
        }
    });

    if (!existingFeeder) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Feeder not found",
        );
    }

    // 2. Only Admin and Zone Manager can change status
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to change feeder status",
        );
    }

    // 3. Zone Manager must belong to feeder's Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingFeeder.substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    // 4. Update status
    const feeder = await prisma.feeder.update({
        where: {
            id,
        },
        data: {
            isActive: payload.isActive,
        },
    });

    return feeder;
};

export const FeederServices = {
    createFeeder,
    getAllFeeders,
    getFeederById,
    updateFeeder,
    updateFeederStatus,
};