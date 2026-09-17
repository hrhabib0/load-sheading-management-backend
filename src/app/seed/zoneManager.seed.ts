import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import config from "../config/index.js";
import { UserRole } from "../../generated/prisma/enums.js";

const seedZoneManager = async () => {
    const email = config.tester_zone_manager_email;
    const password = config.tester_zone_manager_password;
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const zoneManager = await prisma.user.upsert({
        where: {
            email,
        },
        update: {
            name: "DN Zone Manager",
            role: UserRole.ZONE_MANAGER,
            isActive: true,
            password: hashedPassword,
        },
        create: {
            name: "DN Zone Manager",
            email,
            password: hashedPassword,
            role: UserRole.ZONE_MANAGER,
            isActive: true,
        },
    });

    // Find Dhaka North Zone
    const northZone = await prisma.zone.findUnique({
        where: {
            code: "DN-01",
        },
    });

    if (!northZone) {
        throw new Error("Dhaka North Zone not found");
    }

    // Assign Zone Manager
    await prisma.zoneManagerAssignment.upsert({
        where: {
            managerId: zoneManager.id,
        },
        update: {
            zoneId: northZone.id,
            assignedBy: "System"
        },
        create: {
            managerId: zoneManager.id,
            zoneId: northZone.id,
            assignedBy: "System"
        },
    });

    console.log(`Zone Manager seeded: ${zoneManager.email}`);
    console.log("Assigned Zone:", northZone.name);
};

export default seedZoneManager;