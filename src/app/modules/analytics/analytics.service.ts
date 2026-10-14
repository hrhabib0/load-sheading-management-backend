import { prisma } from "../../lib/prisma.js"

const getAdminAnalytics = async () => {
    // total users
    const totalUsers = await prisma.user.count({
        where: {
            isActive: true,
        }
    })

    // total active zones
    const totalActiveZones = await prisma.zone.count({
        where: {
            isActive: true,
        }
    })

    return {
        totalUsers,
        totalActiveZones,
    };
}


export const AnalyticsServices = {
    getAdminAnalytics,
}