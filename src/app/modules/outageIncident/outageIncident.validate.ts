import { z } from "zod";

const createOutageIncidentSchema = z.object({
    feederId: z.string().uuid(
        "Invalid feeder ID",
    ),

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

const linkCustomerReportSchema = z.object({
    reportId: z.string().uuid(
        "Invalid customer report ID",
    ),
})


export const OutageIncidentValidation = {
    createOutageIncidentSchema,
    linkCustomerReportSchema,
}