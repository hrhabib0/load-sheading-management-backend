import { prisma } from "../lib/prisma.js";
import seedAdmin from "./admin.seed.js";
import { seedCustomerPriorities } from "./customerPriority.seed.js";
import { seedInfrastructure } from "./infrustracture.seed.js";
import seedOperator from "./operator.seed.js";
import seedPowerOperator from "./powerOperator.seed.js";
import seedTechnician from "./technician.seed.js";
import seedZoneManager from "./zoneManager.seed.js";

const main = async () => {
    await seedCustomerPriorities();
    await seedInfrastructure();
    await seedAdmin();
    await seedZoneManager();
    await seedPowerOperator();
    await seedOperator();
    await seedTechnician();

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