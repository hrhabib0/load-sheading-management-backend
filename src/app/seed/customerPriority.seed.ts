import { prisma } from "../lib/prisma.js";

export const seedCustomerPriorities = async () => {
    try {
        await prisma.customerPriority.upsert({
            where: { name: "Critical" },
            update: {},
            create: {
                name: "Critical",
                level: 1,
                description:
                    "Critical customers such as hospitals and emergency services",
            },
        });

        await prisma.customerPriority.upsert({
            where: { name: "Residential" },
            update: {},
            create: {
                name: "Residential",
                level: 4,
                description: "Regular residential customers",
            },
        });

        console.log("Customer priorities seeded successfully.");
    } catch (error) {
        console.error("Error seeding customer priorities:", error);
        throw error;
    }
};