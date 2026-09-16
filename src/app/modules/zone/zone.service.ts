import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { ICreateZonePayload, IUpdateZonePayload, IUpdateZoneStatusPayload } from "./zone.interface.js";


const createZone = async (payload: ICreateZonePayload) => {
    const { name, code, description } = payload;

    // Check whether a zone already exists with the same code
    const existingZone = await prisma.zone.findUnique({
        where: {
            code,
        },
    });

    if (existingZone) {
        throw new AppError(
            httpStatus.CONFLICT,
            "A zone already exists with this code",
        );
    }

    const zone = await prisma.zone.create({
        data: {
            name,
            code,
            description,
        },
    });

    return zone;
};

const getAllZones = async () => {
    const zones = await prisma.zone.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return zones;
};

const getZoneById = async (id: string) => {
    const zone = await prisma.zone.findUnique({
        where: {
            id,
        },
    });

    if (!zone) {
        throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
    }

    return zone;
};

const updateZone = async (
    id: string,
    payload: IUpdateZonePayload,
) => {
    const existingZone = await prisma.zone.findUnique({
        where: { id },
    });

    if (!existingZone) {
        throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
    }

    if (payload.code) {
        const zoneWithSameCode = await prisma.zone.findFirst({
            where: {
                code: payload.code,
                NOT: {
                    id,
                },
            },
        });

        if (zoneWithSameCode) {
            throw new AppError(
                httpStatus.CONFLICT,
                "A zone already exists with this code",
            );
        }
    }

    const zone = await prisma.zone.update({
        where: { id },
        data: payload,
    });

    return zone;
};

const updateZoneStatus = async (
    id: string,
    payload: IUpdateZoneStatusPayload,
) => {
    const existingZone = await prisma.zone.findUnique({
        where: { id },
    });

    if (!existingZone) {
        throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
    }

    const zone = await prisma.zone.update({
        where: { id },
        data: {
            isActive: payload.isActive,
        },
    });

    return zone;
};

export const ZoneServices = {
    createZone,
    getAllZones,
    getZoneById,
    updateZone,
    updateZoneStatus,
};