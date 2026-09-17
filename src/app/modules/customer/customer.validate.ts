import { z } from "zod";

const updateCustomerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),

    phone: z
        .string()
        .min(10, "Phone number must be at least 10 characters")
        .max(20, "Phone number must not exceed 20 characters")
        .optional(),
});

export const CustomerValidation = {
    updateCustomerSchema,
};