import httpStatus from "http-status";
import { UserRole } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getAllPowerOperators = async () => {
    const operators = await prisma.user.findMany({
        where: {
            role: UserRole.POWER_OPERATOR
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,

            operatorAssignments: {
                select: {
                    id: true,
                    assignedAt: true,
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            isActive: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if (operators.length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "No power operator found"
        );
    }

    return operators;
};

export const powerOperatorServices = {
    getAllPowerOperators
};