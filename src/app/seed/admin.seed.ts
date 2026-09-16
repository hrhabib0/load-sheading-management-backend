import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import config from "../config/index.js";

const seedAdmin = async () => {
    console.log("admin seeding.....")
    const email = config.tester_admin_email;
    const password = config.terster_admin_password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const admin = await prisma.user.upsert({
        where: {
            email,
        },
        update: {
            name: "System Admin",
            role: "ADMIN",
            isActive: true,
            password: hashedPassword,
        },
        create: {
            name: "System Admin",
            email,
            password: hashedPassword,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log(`Admin seeded: ${admin.email}`);
};

export default seedAdmin;