import { z } from "zod";

const createWorkTaskSchema = z.object({
    incidentId: z.string().uuid(
        "Invalid incident ID",
    ),

    title: z
        .string()
        .min(
            3,
            "Task title must be at least 3 characters",
        )
        .max(
            200,
            "Task title cannot exceed 200 characters",
        ),

    description: z
        .string()
        .max(
            1000,
            "Description cannot exceed 1000 characters",
        )
        .optional(),
})

const assignWorkTaskSchema = z.object({
    technicianId: z.string().uuid(
        "Invalid technician ID",
    ),
})

const rejectWorkTaskSchema = z.object({
    rejectionReason: z
        .string()
        .min(
            5,
            "Rejection reason must be at least 5 characters",
        )
        .max(
            500,
            "Rejection reason cannot exceed 500 characters",
        ),
})

const failWorkTaskSchema = z.object({
    failureReason: z
        .string()
        .min(
            5,
            "Failure reason must be at least 5 characters",
        )
        .max(
            500,
            "Failure reason cannot exceed 500 characters",
        ),
})

const completeWorkTaskSchema = z.object({
    repairNote: z
        .string()
        .min(
            5,
            "Repair note must be at least 5 characters",
        )
        .max(
            1000,
            "Repair note cannot exceed 1000 characters",
        ),
})


export const WorkTaskValidation = {
    createWorkTaskSchema,
    assignWorkTaskSchema,
    rejectWorkTaskSchema,
    failWorkTaskSchema,
    completeWorkTaskSchema
}