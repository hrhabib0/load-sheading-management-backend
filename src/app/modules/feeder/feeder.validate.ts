import { z } from "zod";

const createFeederSchema = z.object({
    substationId: z.uuid("Invalid substation ID"),

    name: z
        .string()
        .min(2, "Feeder name must be at least 2 characters")
        .max(100, "Feeder name must not exceed 100 characters"),

    code: z
        .string()
        .min(2, "Feeder code must be at least 2 characters")
        .max(20, "Feeder code must not exceed 20 characters"),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateFeederSchema = z.object({
    name: z
        .string()
        .min(2, "Feeder name must be at least 2 characters")
        .max(100, "Feeder name must not exceed 100 characters")
        .optional(),

    code: z
        .string()
        .min(2, "Feeder code must be at least 2 characters")
        .max(20, "Feeder code must not exceed 20 characters")
        .optional(),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateFeederStatusSchema = z.object({
    isActive: z.boolean({
        message: "isActive must be a boolean",
    }),
});

export const FeederValidation = {
    createFeederSchema,
    updateFeederSchema,
    updateFeederStatusSchema,
};