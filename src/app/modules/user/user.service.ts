import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import httpStatus from "http-status";
import { IGetAllUsersQuery } from "./user.interface.js";


const getAllUsers = async (query: IGetAllUsersQuery) => {
    const { page, limit, search, role, isActive } = query;

    const where = {
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}),
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
    };

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    if (page > 1 && users.length === 0 && total > 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "No users found on this page",
        );
    }

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const UserServices = {
    getAllUsers,
}