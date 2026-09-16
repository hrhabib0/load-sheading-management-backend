import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";

import {
    ICreateSubstationPayload,
    IUpdateSubstationPayload,
    IUpdateSubstationStatusPayload,
} from "./substation.interface.js";
import { AppError } from "../../errors/AppError.js";
import { UserRole } from "../../../generated/prisma/enums.js";

interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const createSubstation = async (
    payload: ICreateSubstationPayload,
    user: IUserContext,
) => {
    const { zoneId, name, code, location } = payload;

    // Check whether the Zone exists
    const zone = await prisma.zone.findUnique({
        where: {
            id: zoneId,
        },
    });

    if (!zone) {
        throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
    }

    // Cannot create infrastructure inside an inactive Zone
    if (!zone.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create a substation under an inactive zone",
        );
    }

    // Zone Manager can only create inside their assigned Zone
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
                "You are not assigned to this zone",
            );
        }
    }

    // Check duplicate code
    const existingSubstation = await prisma.substation.findUnique({
        where: {
            code,
        },
    });

    if (existingSubstation) {
        throw new AppError(
            httpStatus.CONFLICT,
            "A substation already exists with this code",
        );
    }

    const substation = await prisma.substation.create({
        data: {
            zoneId,
            name,
            code,
            location,
        },
    });

    return substation;
};

const getAllSubstations = async (user: IUserContext) => {
    if (user.role === UserRole.ADMIN) {
        const substations = prisma.substation.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return substations;
    }

    if (
        user.role === UserRole.ZONE_MANAGER ||
        user.role === UserRole.POWER_OPERATOR
    ) {
        const substations = await prisma.substation.findMany({
            where: {
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
            orderBy: {
                createdAt: "desc",
            },
        });

        return substations;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view substations",
    );
};

const getSubstationById = async (
    id: string,
    user: IUserContext,
) => {
    const substation = await prisma.substation.findUnique({
        where: {
            id,
        },
    });

    if (!substation) {
        throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
    }

    if (user.role === "ADMIN") {
        return substation;
    }

    if (
        user.role === "ZONE_MANAGER" ||
        user.role === "POWER_OPERATOR"
    ) {
        const hasAccess = await prisma.zone.findFirst({
            where: {
                id: substation.zoneId,
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
                "You are not authorized to access this substation",
            );
        }

        return substation;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to view this substation",
    );
};

const updateSubstation = async (
    id: string,
    payload: IUpdateSubstationPayload,
    user: IUserContext,
) => {
    const existingSubstation = await prisma.substation.findUnique({
        where: {
            id,
        },
    });

    if (!existingSubstation) {
        throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
    }

    // Only Admin and Zone Manager can update
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this substation",
        );
    }

    // Zone Manager must belong to this Substation's Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingSubstation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    // Check duplicate code
    if (payload.code) {
        const duplicateSubstation = await prisma.substation.findFirst({
            where: {
                code: payload.code,
                NOT: {
                    id,
                },
            },
        });

        if (duplicateSubstation) {
            throw new AppError(
                httpStatus.CONFLICT,
                "A substation already exists with this code",
            );
        }
    }

    const substation = await prisma.substation.update({
        where: {
            id,
        },
        data: payload,
    });

    return substation;
};

const updateSubstationStatus = async (
    id: string,
    payload: IUpdateSubstationStatusPayload,
    user: IUserContext,
) => {
    const existingSubstation = await prisma.substation.findUnique({
        where: {
            id,
        },
    });

    if (!existingSubstation) {
        throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
    }

    // Only Admin and Zone Manager can activate/deactivate
    if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.ZONE_MANAGER
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to change substation status",
        );
    }

    // Zone Manager must belong to this Zone
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: existingSubstation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this zone",
            );
        }
    }

    const substation = await prisma.substation.update({
        where: {
            id,
        },
        data: {
            isActive: payload.isActive,
        },
    });

    return substation;
};

export const SubstationServices = {
    createSubstation,
    getAllSubstations,
    getSubstationById,
    updateSubstation,
    updateSubstationStatus,
};