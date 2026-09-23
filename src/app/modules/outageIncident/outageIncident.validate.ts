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


const closeOutageIncidentSchema = z.object({
    resolutionNote: z
        .string()
        .min(
            5,
            "Resolution note must be at least 5 characters",
        )
        .max(
            1000,
            "Resolution note cannot exceed 1000 characters",
        ),
})


export const OutageIncidentValidation = {
    createOutageIncidentSchema,
    linkCustomerReportSchema,
    closeOutageIncidentSchema,
}