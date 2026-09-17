import { z } from "zod";

const createAreaSchema = z.object({
    feederId: z.uuid("Invalid feeder ID"),

    name: z
        .string()
        .min(2, "Area name must be at least 2 characters")
        .max(100, "Area name must not exceed 100 characters"),

    code: z
        .string()
        .min(2, "Area code must be at least 2 characters")
        .max(20, "Area code must not exceed 20 characters"),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateAreaSchema = z.object({
    name: z
        .string()
        .min(2, "Area name must be at least 2 characters")
        .max(100, "Area name must not exceed 100 characters")
        .optional(),

    code: z
        .string()
        .min(2, "Area code must be at least 2 characters")
        .max(20, "Area code must not exceed 20 characters")
        .optional(),

    description: z
        .string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),
});

const updateAreaStatusSchema = z.object({
    isActive: z.boolean({
        message: "isActive must be a boolean",
    }),
});

export const AreaValidation = {
    createAreaSchema,
    updateAreaSchema,
    updateAreaStatusSchema,
};