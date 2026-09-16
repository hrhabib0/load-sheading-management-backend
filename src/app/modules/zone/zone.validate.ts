import { z } from "zod";

const createZoneSchema = z.object({
    name: z
        .string()
        .min(2, "Zone name must be at least 2 characters")
        .max(100, "Zone name must not exceed 100 characters"),

    code: z
        .string()
        .min(2, "Zone code must be at least 2 characters")
        .max(20, "Zone code must not exceed 20 characters"),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateZoneSchema = z.object({
    name: z
        .string()
        .min(2, "Zone name must be at least 2 characters")
        .max(100, "Zone name must not exceed 100 characters")
        .optional(),

    code: z
        .string()
        .min(2, "Zone code must be at least 2 characters")
        .max(20, "Zone code must not exceed 20 characters")
        .optional(),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateZoneStatusSchema = z.object({
    isActive: z.boolean({
        message: "isActive must be a boolean",
    }),
});

export const ZoneValidation = {
    createZoneSchema,
    updateZoneSchema,
    updateZoneStatusSchema,
};