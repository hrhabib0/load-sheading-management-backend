import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import config from "../config/index.js";
import { UserRole } from "../../generated/prisma/enums.js";

const seedTechnician = async () => {
    const email = config.tester_technician_email;
    const password = config.tester_technician_password;
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const admin = await prisma.user.upsert({
        where: {
            email,
        },
        update: {
            name: "Testing Technician",
            role: UserRole.TECHNICIAN,
            isActive: true,
            password: hashedPassword,
        },
        create: {
            name: "Testing Technician",
            email,
            password: hashedPassword,
            role: UserRole.TECHNICIAN,
            isActive: true,
        },
    });

    console.log(`Technician seeded: ${admin.email}`);
};

export default seedTechnician;