import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import config from "../config/index.js";
import { UserRole } from "../../generated/prisma/enums.js";

const seedPowerOperator = async () => {
    const email = config.tester_power_operator_email;
    const password = config.tester_power_operator_password;
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const operator = await prisma.user.upsert({
        where: {
            email,
        },
        update: {
            name: "DN Power Operator",
            role: "POWER_OPERATOR",
            isActive: true,
            password: hashedPassword,
        },
        create: {
            name: "DN Power Operator",
            email,
            password: hashedPassword,
            role: "POWER_OPERATOR",
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

    // Assign Power Operator
    await prisma.operatorZoneAssignment.upsert({
        where: {
            operatorId_zoneId: {
                operatorId: operator.id,
                zoneId: northZone.id,
            },
        },
        update: {},
        create: {
            operatorId: operator.id,
            zoneId: northZone.id,
        },
    });

    console.log("Power Operator:", operator.email);
    console.log("Assigned Zone:", northZone.name);
};

export default seedPowerOperator;