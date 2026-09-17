import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import config from "../config/index.js";
import { UserRole } from "../../generated/prisma/enums.js";

// for testing. no assignment
const seedOperator = async () => {
    const email = config.tester_operator_email;
    const password = config.tester_operator_password;
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const operator = await prisma.user.upsert({
        where: {
            email,
        },
        update: {
            name: "Test Operator",
            role: UserRole.POWER_OPERATOR,
            isActive: true,
            password: hashedPassword,
        },
        create: {
            name: "Test Operator",
            email,
            password: hashedPassword,
            role: UserRole.POWER_OPERATOR,
            isActive: true,
        },
    });

    console.log(`Operator seeded: ${operator.email}`);
};

export default seedOperator;