import { prisma } from "../lib/prisma.js";
import seedAdmin from "./admin.seed.js";
import { seedCustomerPriorities } from "./customerPriority.seed.js";
import { seedInfrastructure } from "./infrustracture.seed.js";

const main = async () => {
    await seedCustomerPriorities();
    await seedInfrastructure();
    await seedAdmin();

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