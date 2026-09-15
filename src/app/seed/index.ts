import { prisma } from "../lib/prisma.js";
import { seedCustomerPriorities } from "./customerPriority.seed.js";
import { seedInfrastructure } from "./infrustracture.seed.js";

const main = async () => {
    await seedCustomerPriorities();
    await seedInfrastructure();

    console.log("All seed operations completed successfully.");
};

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });