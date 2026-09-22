import { z } from "zod";

export const createCustomerReportSchema = z.object({
    body: z.object({
        description: z
            .string()
            .min(
                10,
                "Description must be at least 10 characters",
            )
            .max(
                1000,
                "Description cannot exceed 1000 characters",
            ),
    }),
});