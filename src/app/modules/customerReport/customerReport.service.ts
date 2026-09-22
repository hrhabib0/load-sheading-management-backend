import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { ICreateCustomerReportPayload } from "./customerReport.interface.js";
import { IUserContext } from "../auth/auth.interface.js";
import httpStatus from "http-status";
import { CustomerReportStatus, UserRole } from "../../../generated/prisma/enums.js";
import { Prisma } from "../../../generated/prisma/client.js";


const createCustomerReport = async (
    payload: ICreateCustomerReportPayload,
    user: IUserContext,
) => {
    const customer = await prisma.customerProfile.findUnique({
        where: {
            userId: user.userId,
        },
        select: {
            id: true,
            userId: true,
            areaId: true,
            area: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    feederId: true,
                },
            },
        },
    });

    if (!customer) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer profile not found",
        );
    }

    const existingReport = await prisma.customerReport.findFirst({
        where: {
            customerId: customer.id,
            status: CustomerReportStatus.PENDING,
        },
    });

    if (existingReport) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You already have a pending customer report",
        );
    }

    const report = await prisma.customerReport.create({
        data: {
            customerId: customer.id,
            description: payload.description,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    area: {
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

    return report;
};

const getMyReports = async (
    user: IUserContext,
) => {
    const customer = await prisma.customerProfile.findUnique({
        where: {
            userId: user.userId,
        },
        select: {
            id: true,
        },
    });

    if (!customer) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer profile not found",
        );
    }

    const reports = await prisma.customerReport.findMany({
        where: {
            customerId: customer.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            incident: {
                select: {
                    id: true,
                    status: true,
                    description: true,
                    createdAt: true,
                },
            },
        },
    });

    return reports;
};

const getAllReports = async (
    user: IUserContext,
) => {
    const where: Prisma.CustomerReportWhereInput = {};

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

        where.customer = {
            area: {
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

    const reports = await prisma.customerReport.findMany({
        where,

        orderBy: {
            createdAt: "desc",
        },

        include: {
            customer: {
                select: {
                    id: true,
                    userId: true,

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

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
            },

            incident: {
                select: {
                    id: true,
                    status: true,
                    description: true,
                    createdAt: true,
                },
            },
        },
    });

    return reports;
};

const getReportById = async (
    reportId: string,
    user: IUserContext,
) => {
    const report = await prisma.customerReport.findUnique({
        where: {
            id: reportId,
        },

        include: {
            customer: {
                select: {
                    id: true,
                    userId: true,

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

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
            },

            incident: {
                select: {
                    id: true,
                    status: true,
                    description: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!report) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer report not found",
        );
    }

    /*
     * Customer can only see their own report.
     */
    if (
        user.role === UserRole.CUSTOMER &&
        report.customer.userId !== user.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to view this report",
        );
    }

    /*
     * Admin can see every report.
     */
    if (user.role === UserRole.ADMIN) {
        return report;
    }

    /*
     * Zone Manager
     */
    if (user.role === UserRole.ZONE_MANAGER) {
        const assignment = await prisma.zoneManagerAssignment.findFirst({
            where: {
                managerId: user.userId,
                zoneId: report.customer.area.feeder.substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to view this report",
            );
        }
    }

    /*
     * Power Operator
     */
    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId: report.customer.area.feeder.substation.zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to view this report",
            );
        }
    }

    return report;
};

const cancelMyReport = async (
    reportId: string,
    user: IUserContext,
) => {
    const customer = await prisma.customerProfile.findUnique({
        where: {
            userId: user.userId,
        },
        select: {
            id: true,
        },
    });

    if (!customer) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer profile not found",
        );
    }

    const report = await prisma.customerReport.findUnique({
        where: {
            id: reportId,
        },
    });

    if (!report) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer report not found",
        );
    }

    if (report.customerId !== customer.id) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to cancel this report",
        );
    }

    if (report.status !== CustomerReportStatus.PENDING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only pending reports can be cancelled",
        );
    }

    const cancelledReport = await prisma.customerReport.update({
        where: {
            id: reportId,
        },
        data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
        },
    });

    return cancelledReport;
};

export const CustomerReportServices = {
    createCustomerReport,
    getMyReports,
    getAllReports,
    getReportById,
    cancelMyReport,
};