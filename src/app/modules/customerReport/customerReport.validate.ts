import { z } from "zod";

const createCustomerReportSchema = z.object({
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
})

export const CustomerReportValidation = {
    createCustomerReportSchema,
}