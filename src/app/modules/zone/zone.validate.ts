import { z } from "zod";

export const createZoneSchema = z.object({
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

export const ZoneValidation = {
    createZoneSchema,
};