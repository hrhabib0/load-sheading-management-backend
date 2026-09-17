import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { AppError } from "../../errors/AppError.js";
import {
    ICreateAreaPayload,
    IUpdateAreaPayload,
    IUpdateAreaStatusPayload,
} from "./area.interface.js";


interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const createArea = async (
    payload: ICreateAreaPayload,
    user: IUserContext,
) => {
    const { feederId, name, code, description } = payload;

    // 1. Check whether the Feeder exists
    const feeder = await prisma.feeder.findUnique({
        where: {
            id: feederId,
        },
        include: {
            substation: true,
        },
    });

    if (!feeder) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Feeder not found",
        );
    }

    // 2. Cannot create Area under an inactive Feeder
    if (!feeder.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create an area under an inactive feeder",
        );
    }

    // 3. Zone Manager can only manage their assigned Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: feeder.substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    // 4. Check duplicate Area code
    const existingArea = await prisma.area.findUnique({
        where: {
            code,
        },
    });

    if (existingArea) {
        throw new AppError(
            httpStatus.CONFLICT,
            "An area already exists with this code",
        );
    }

    // 5. Create Area
    const area = await prisma.area.create({
        data: {
            feederId,
            name,
            code,
            description,
        },
    });

    return area;
};

const getAllAreas = async (user: IUserContext) => {
    // Admin can see all Areas
    if (user.role === UserRole.ADMIN) {
        return prisma.area.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    // Zone Manager and Power Operator
    // can only see Areas inside their assigned Zones
    if (
        user.role === UserRole.ZONE_MANAGER ||
        user.role === UserRole.POWER_OPERATOR
    ) {
        return prisma.area.findMany({
            where: {
                feeder: {
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
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view areas",
    );
};

const getAreaById = async (
    id: string,
    user: IUserContext,
) => {
    // 1. Find Area
    const area = await prisma.area.findUnique({
        where: {
            id,
        },
        include: {
            feeder: {
                include: {
                    substation: true,
                },
            },
        },
    });

    if (!area) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Area not found",
        );
    }

    // 2. Admin can access everything
    if (user.role === UserRole.ADMIN) {
        return area;
    }

    // 3. Zone Manager / Power Operator
    if (
        user.role === UserRole.ZONE_MANAGER ||
        user.role === UserRole.POWER_OPERATOR
    ) {
        const hasAccess = await prisma.zone.findFirst({
            where: {
                id: area.feeder.substation.zoneId,
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
                "You are not authorized to access this area",
            );
        }

        return area;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view this area",
    );
};

const updateArea = async (
    id: string,
    payload: IUpdateAreaPayload,
    user: IUserContext,
) => {
    // 1. Find Area
    const existingArea = await prisma.area.findUnique({
        where: {
            id,
        },
        include: {
            feeder: {
                include: {
                    substation: true,
                },
            },
        },
    });

    if (!existingArea) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Area not found",
        );
    }

    // 2. Only Admin and Zone Manager can update
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this area",
        );
    }

    // 3. Zone Manager must belong to Area's Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingArea.feeder.substation.zoneId,
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
        const duplicateArea = await prisma.area.findFirst({
            where: {
                code: payload.code,
                NOT: {
                    id,
                },
            },
        });

        if (duplicateArea) {
            throw new AppError(
                httpStatus.CONFLICT,
                "An area already exists with this code",
            );
        }
    }

    // 5. Update Area
    const area = await prisma.area.update({
        where: {
            id,
        },
        data: payload,
    });

    return area;
};

const updateAreaStatus = async (
    id: string,
    payload: IUpdateAreaStatusPayload,
    user: IUserContext,
) => {
    // 1. Find Area
    const existingArea = await prisma.area.findUnique({
        where: {
            id,
        },
        include: {
            feeder: {
                include: {
                    substation: true,
                },
            },
        },
    });

    if (!existingArea) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Area not found",
        );
    }

    // 2. Only Admin and Zone Manager can change status
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to change area status",
        );
    }

    // 3. Zone Manager must belong to Area's Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingArea.feeder.substation.zoneId,
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
    const area = await prisma.area.update({
        where: {
            id,
        },
        data: {
            isActive: payload.isActive,
        },
    });

    return area;
};

export const AreaServices = {
    createArea,
    getAllAreas,
    getAreaById,
    updateArea,
    updateAreaStatus,
};