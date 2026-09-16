import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { ICreateZonePayload } from "./zone.interface.js";


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

export const ZoneServices = {
    createZone,
};