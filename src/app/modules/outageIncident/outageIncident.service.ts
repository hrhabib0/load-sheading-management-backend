import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { IUserContext } from "../auth/auth.interface.js";
import { ICreateOutageIncidentPayload } from "./outageIncident.interface.js";
import { CustomerReportStatus, OutageIncidentStatus, UserRole } from "../../../generated/prisma/enums.js";
import { Prisma } from "../../../generated/prisma/client.js";


const createOutageIncident = async (
    payload: ICreateOutageIncidentPayload,
    user: IUserContext,
) => {
    const feeder = await prisma.feeder.findUnique({
        where: {
            id: payload.feederId,
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
                    zoneId: true,
                },
            },
        },
    });

    if (!feeder) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Feeder not found",
        );
    }

    if (!feeder.isActive) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot create outage incident for an inactive feeder",
        );
    }

    const zoneId = feeder.substation.zoneId;

    /*
     * Authorization
     */

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

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
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

    /*
     * Check whether this feeder already has
     * an active outage incident.
     */

    const existingIncident = await prisma.outageIncident.findFirst({
        where: {
            feederId: feeder.id,
            status: {
                in: [
                    "INVESTIGATING",
                    "REPAIRING",
                    "RESTORATION_PENDING",
                ],
            },
        },
    });

    if (existingIncident) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "An active outage incident already exists for this feeder",
        );
    }

    const incident = await prisma.outageIncident.create({
        data: {
            feederId: feeder.id,
            description: payload.description,
            createdBy: user.userId,
            status: OutageIncidentStatus.INVESTIGATING,
        },

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
    });

    return incident;
};


const getAllOutageIncidents = async (
    user: IUserContext,
) => {
    const where: Prisma.OutageIncidentWhereInput = {};

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

        where.feeder = {
            substation: {
                zoneId: {
                    in: zoneIds,
                },
            },
        };
    }

    const incidents = await prisma.outageIncident.findMany({
        where,

        orderBy: {
            createdAt: "desc",
        },

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

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return incidents;
};


const getOutageIncidentById = async (
    incidentId: string,
    user: IUserContext,
) => {
    const incident = await prisma.outageIncident.findUnique({
        where: {
            id: incidentId,
        },

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

                    areas: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },

            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },

            reports: {
                select: {
                    id: true,
                    description: true,
                    status: true,
                    createdAt: true,

                    customer: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!incident) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Outage incident not found",
        );
    }

    if (user.role === UserRole.ADMIN) {
        return incident;
    }

    const zoneId = incident.feeder.substation.zoneId;

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
                "You are not authorized to view this outage incident",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to view this outage incident",
            );
        }
    }

    return incident;
};


const linkCustomerReport = async (
    incidentId: string,
    reportId: string,
    user: IUserContext,
) => {
    const incident = await prisma.outageIncident.findUnique({
        where: {
            id: incidentId,
        },
        select: {
            id: true,
            feederId: true,
            status: true,

            feeder: {
                select: {
                    substation: {
                        select: {
                            zoneId: true,
                        },
                    },
                },
            },
        },
    });

    if (!incident) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Outage incident not found",
        );
    }

    if (
        ![
            "INVESTIGATING",
            "REPAIRING",
            "RESTORATION_PENDING",
        ].includes(incident.status)
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Customer reports cannot be linked to this incident",
        );
    }

    const report = await prisma.customerReport.findUnique({
        where: {
            id: reportId,
        },
        select: {
            id: true,
            status: true,
            customer: {
                select: {
                    area: {
                        select: {
                            feederId: true,
                        },
                    },
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

    if (report.status !== CustomerReportStatus.PENDING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only pending customer reports can be linked",
        );
    }

    /*
     * The report must belong to the same feeder
     * as the outage incident.
     */

    if (
        report.customer.area.feederId !==
        incident.feederId
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Customer report does not belong to this feeder",
        );
    }

    /*
     * Check authorization.
     */

    const zoneId = incident.feeder.substation.zoneId;

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
                "You are not authorized to link this report",
            );
        }
    }

    if (user.role === UserRole.POWER_OPERATOR) {
        const assignment = await prisma.operatorZoneAssignment.findFirst({
            where: {
                operatorId: user.userId,
                zoneId,
            },
        });

        if (!assignment) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to link this report",
            );
        }
    }

    const result = await prisma.$transaction(
        async (tx) => {
            const updatedReport = await tx.customerReport.update({
                where: {
                    id: reportId,
                },
                data: {
                    incidentId,
                    status: CustomerReportStatus.LINKED,
                    linkedAt: new Date(),
                },
            });

            return updatedReport;
        },
    );

    return result;
};



export const OutageIncidentServices = {
    createOutageIncident,
    getAllOutageIncidents,
    getOutageIncidentById,
    linkCustomerReport,
};