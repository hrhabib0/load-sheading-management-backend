import { UserRole } from "../../../generated/prisma/enums.js";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IUpdateCustomerPayload } from "./customer.interface.js";

interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}

const getMyProfile = async (user: IUserContext) => {
    const customer = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            customerProfile: {
                select: {
                    id: true,
                    area: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    priority: {
                        select: {
                            id: true,
                            name: true,
                            level: true,
                            description: true,
                        },
                    },
                },
            },
        },
    });

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    if (!customer.customerProfile) {
        throw new AppError(404, "Customer profile not found");
    }

    return customer;
};

const updateMyProfile = async (
    payload: IUpdateCustomerPayload,
    user: IUserContext,
) => {
    const customer = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            customerProfile: true,
        },
    });

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    if (!customer.customerProfile) {
        throw new AppError(404, "Customer profile not found");
    }

    if (customer.role !== UserRole.CUSTOMER) {
        throw new AppError(403, "Only customers can update their profile");
    }

    if (!customer.isActive) {
        throw new AppError(403, "Your account is inactive");
    }

    const updatedCustomer = await prisma.user.update({
        where: {
            id: user.userId,
        },
        data: {
            ...(payload.name !== undefined && {
                name: payload.name,
            }),
            ...(payload.phone !== undefined && {
                phone: payload.phone,
            }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            updatedAt: true,
            customerProfile: {
                select: {
                    id: true,
                    area: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    priority: {
                        select: {
                            id: true,
                            name: true,
                            level: true,
                        },
                    },
                },
            },
        },
    });

    return updatedCustomer;
};

export const CustomerServices = {
    getMyProfile,
    updateMyProfile,
};