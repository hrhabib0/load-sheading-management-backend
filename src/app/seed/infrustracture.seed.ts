import { prisma } from "../lib/prisma.js";

export const seedInfrastructure = async () => {
    try {
        // --------------------
        // Zones
        // --------------------
        const dhakaNorth = await prisma.zone.upsert({
            where: { code: "DN-01" },
            update: {},
            create: {
                name: "Dhaka North",
                code: "DN-01",
                description: "Dhaka North Distribution Zone",
            },
        });

        const dhakaSouth = await prisma.zone.upsert({
            where: { code: "DS-01" },
            update: {},
            create: {
                name: "Dhaka South",
                code: "DS-01",
                description: "Dhaka South Distribution Zone",
            },
        });

        // --------------------
        // Substations
        // --------------------
        const uttaraSubstation = await prisma.substation.upsert({
            where: { code: "US-01" },
            update: {},
            create: {
                name: "Uttara Substation",
                code: "US-01",
                location: "Uttara",
                zoneId: dhakaNorth.id,
            },
        });

        const mirpurSubstation = await prisma.substation.upsert({
            where: { code: "MS-01" },
            update: {},
            create: {
                name: "Mirpur Substation",
                code: "MS-01",
                location: "Mirpur",
                zoneId: dhakaNorth.id,
            },
        });

        const dhanmondiSubstation = await prisma.substation.upsert({
            where: { code: "DMS-01" },
            update: {},
            create: {
                name: "Dhanmondi Substation",
                code: "DMS-01",
                location: "Dhanmondi",
                zoneId: dhakaSouth.id,
            },
        });

        // --------------------
        // Feeders
        // --------------------
        const uttaraFeeder01 = await prisma.feeder.upsert({
            where: { code: "FDR-U01" },
            update: {},
            create: {
                name: "Uttara Feeder 01",
                code: "FDR-U01",
                description: "Main feeder serving Uttara Sector 1",
                substationId: uttaraSubstation.id,
            },
        });

        const uttaraFeeder02 = await prisma.feeder.upsert({
            where: { code: "FDR-U02" },
            update: {},
            create: {
                name: "Uttara Feeder 02",
                code: "FDR-U02",
                description: "Main feeder serving Uttara Sector 2",
                substationId: uttaraSubstation.id,
            },
        });

        const mirpurFeeder01 = await prisma.feeder.upsert({
            where: { code: "FDR-M01" },
            update: {},
            create: {
                name: "Mirpur Feeder 01",
                code: "FDR-M01",
                description: "Main feeder serving Mirpur Section A",
                substationId: mirpurSubstation.id,
            },
        });

        const dhanmondiFeeder01 = await prisma.feeder.upsert({
            where: { code: "FDR-D01" },
            update: {},
            create: {
                name: "Dhanmondi Feeder 01",
                code: "FDR-D01",
                description: "Main feeder serving Dhanmondi Area 1",
                substationId: dhanmondiSubstation.id,
            },
        });

        // --------------------
        // Areas
        // --------------------
        await prisma.area.upsert({
            where: { code: "SEC-U01" },
            update: {},
            create: {
                name: "Uttara Sector 1",
                code: "SEC-U01",
                description: "Uttara Sector 1 residential area",
                feederId: uttaraFeeder01.id,
            },
        });

        await prisma.area.upsert({
            where: { code: "SEC-U02" },
            update: {},
            create: {
                name: "Uttara Sector 2",
                code: "SEC-U02",
                description: "Uttara Sector 2 residential area",
                feederId: uttaraFeeder02.id,
            },
        });

        await prisma.area.upsert({
            where: { code: "SEC-M01" },
            update: {},
            create: {
                name: "Mirpur Section A",
                code: "SEC-M01",
                description: "Mirpur Section A residential area",
                feederId: mirpurFeeder01.id,
            },
        });

        await prisma.area.upsert({
            where: { code: "SEC-D01" },
            update: {},
            create: {
                name: "Dhanmondi Area 1",
                code: "SEC-D01",
                description: "Dhanmondi Area 1 residential area",
                feederId: dhanmondiFeeder01.id,
            },
        });

        console.log("Infrastructure seeded successfully.");
    } catch (error) {
        console.error("Error seeding infrastructure:", error);
        throw error;
    }
};