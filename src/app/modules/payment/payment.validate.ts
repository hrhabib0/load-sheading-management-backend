import { z } from "zod";

export const createPaymentSchema = z.object({
    amount: z
        .number()
        .positive("Amount must be greater than 0"),
})