import { z } from "zod";

const createLoadSheddingScheduleSchema = z
    .object({
        title: z
            .string()
            .min(3, "Title must be at least 3 characters")
            .max(200, "Title must not exceed 200 characters"),

        description: z
            .string()
            .max(1000, "Description must not exceed 1000 characters")
            .optional(),

        requiredReduction: z
            .number()
            .min(0, "Required reduction cannot be negative")
            .max(100, "Required reduction cannot exceed 100")
            .optional(),

        scheduledStartAt: z.coerce.date(),

        scheduledEndAt: z.coerce.date(),

        feederIds: z
            .array(z.uuid("Invalid feeder ID"))
            .min(1, "At least one feeder is required")
            .max(50, "Cannot select more than 50 feeders"),
    })
    .refine(
        (data) => data.scheduledEndAt > data.scheduledStartAt,
        {
            message: "Scheduled end time must be after start time",
            path: ["scheduledEndAt"],
        },
    );

const updateLoadSheddingScheduleSchema = z
    .object({
        title: z
            .string()
            .min(3, "Title must be at least 3 characters")
            .max(200, "Title must not exceed 200 characters")
            .optional(),

        description: z
            .string()
            .max(1000, "Description must not exceed 1000 characters")
            .optional(),

        requiredReduction: z
            .number()
            .min(0, "Required reduction cannot be negative")
            .max(100, "Required reduction cannot exceed 100")
            .optional(),

        scheduledStartAt: z.coerce.date().optional(),

        scheduledEndAt: z.coerce.date().optional(),

        feederIds: z
            .array(z.uuid("Invalid feeder ID"))
            .min(1, "At least one feeder is required")
            .max(50, "Cannot select more than 50 feeders")
            .optional(),
    })
    .refine(
        (data) => {
            if (
                data.scheduledStartAt &&
                data.scheduledEndAt
            ) {
                return (
                    data.scheduledEndAt >
                    data.scheduledStartAt
                );
            }

            return true;
        },
        {
            message: "Scheduled end time must be after start time",
            path: ["scheduledEndAt"],
        },
    );

export const LoadSheddingValidation = {
    createLoadSheddingScheduleSchema,
    updateLoadSheddingScheduleSchema,
};