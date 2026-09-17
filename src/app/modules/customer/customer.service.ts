import { UserRole } from "../../../generated/prisma/enums.js";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { IUpdateCustomerByStaffPayload, IUpdateCustomerPayload, IUpdateCustomerStatusPayload } from "./customer.interface.js";
import httpStatus from "http-status";

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

const getAllCustomers = async (user: IUserContext) => {
    
    const customers = await prisma.user.findMany({
        where: {
            role: UserRole.CUSTOMER,
            ...(user.role === UserRole.ZONE_MANAGER
                ? {
                    customerProfile: {
                        area: {
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
                }
                : user.role === UserRole.POWER_OPERATOR
                    ? {
                        customerProfile: {
                            area: {
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
                    }
                    : {}),
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
        orderBy: {
            createdAt: "desc",
        },
    });

    return customers;
};


const getCustomerById = async (
    customerId: string,
    user: IUserContext,
) => {
    const customer = await prisma.user.findUnique({
        where: {
            id: customerId,
            role: UserRole.CUSTOMER,
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

    const zoneId =
        customer.customerProfile.area.feeder.substation.zone.id;

    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                403,
                "You are not assigned to this customer's zone",
            );
        }
    }

    if (user.role === "POWER_OPERATOR") {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                403,
                "You are not assigned to this customer's zone",
            );
        }
    }

    return customer;
};


const updateCustomerByStaff = async (
    customerId: string,
    payload: IUpdateCustomerByStaffPayload,
    user: IUserContext,
) => {
    const customer = await prisma.user.findUnique({
        where: {
            id: customerId,
            role: UserRole.CUSTOMER,
        },
        include: {
            customerProfile: {
                include: {
                    area: {
                        include: {
                            feeder: {
                                include: {
                                    substation: true,
                                },
                            },
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

    const currentZoneId =
        customer.customerProfile.area.feeder.substation.zoneId;

    // Zone Manager can only manage customers in their assigned Zone.
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: currentZoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                403,
                "You are not assigned to this customer's zone",
            );
        }
    }

    // Validate new Area if supplied.
    let newArea;

    if (payload.areaId) {
        newArea = await prisma.area.findUnique({
            where: {
                id: payload.areaId,
            },
            include: {
                feeder: {
                    include: {
                        substation: true,
                    },
                },
            },
        });

        if (!newArea) {
            throw new AppError(404, "New area not found");
        }

        if (!newArea.isActive) {
            throw new AppError(400, "New area is inactive");
        }

        const newZoneId = newArea.feeder.substation.zoneId;

        // Zone Manager cannot move customer outside assigned Zone.
        if (user.role === "ZONE_MANAGER") {
            if (newZoneId !== currentZoneId) {
                throw new AppError(
                    403,
                    "You cannot move a customer to another zone",
                );
            }
        }
    }

    // Validate priority if supplied.
    if (payload.priorityId) {
        const priority = await prisma.customerPriority.findUnique({
            where: {
                id: payload.priorityId,
            },
        });

        if (!priority) {
            throw new AppError(404, "Customer priority not found");
        }

        if (!priority.isActive) {
            throw new AppError(400, "Customer priority is inactive");
        }
    }

    const updatedCustomer = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: {
                id: customerId,
            },
            data: {
                ...(payload.name !== undefined && {
                    name: payload.name,
                }),
                ...(payload.phone !== undefined && {
                    phone: payload.phone,
                }),
            },
        });

        const updatedProfile = await tx.customerProfile.update({
            where: {
                id: customer.customerProfile!.id,
            },
            data: {
                ...(payload.areaId !== undefined && {
                    areaId: payload.areaId,
                }),
                ...(payload.priorityId !== undefined && {
                    priorityId: payload.priorityId,
                }),
            },
        });

        return {
            updatedUser,
            updatedProfile,
        };
    });

    return updatedCustomer;
};


const updateCustomerStatus = async (
    customerId: string,
    payload: IUpdateCustomerStatusPayload,
) => {
    const customer = await prisma.user.findUnique({
        where: {
            id: customerId,
            role: UserRole.CUSTOMER,
        },
    });

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    const updatedCustomer = await prisma.user.update({
        where: {
            id: customerId,
        },
        data: {
            isActive: payload.isActive,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });

    return updatedCustomer;
};

export const CustomerServices = {
    getMyProfile,
    updateMyProfile,
    getAllCustomers,
    getCustomerById,
    updateCustomerByStaff,
    updateCustomerStatus,
};