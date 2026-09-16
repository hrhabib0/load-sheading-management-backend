import { z } from "zod";

const createSubstationSchema = z.object({
  zoneId: z.uuid("Invalid zone ID"),

  name: z
    .string()
    .min(2, "Substation name must be at least 2 characters")
    .max(100, "Substation name must not exceed 100 characters"),

  code: z
    .string()
    .min(2, "Substation code must be at least 2 characters")
    .max(20, "Substation code must not exceed 20 characters"),

  location: z
    .string()
    .max(255, "Location must not exceed 255 characters")
    .optional(),
});

const updateSubstationSchema = z.object({
  name: z
    .string()
    .min(2, "Substation name must be at least 2 characters")
    .max(100, "Substation name must not exceed 100 characters")
    .optional(),

  code: z
    .string()
    .min(2, "Substation code must be at least 2 characters")
    .max(20, "Substation code must not exceed 20 characters")
    .optional(),

  location: z
    .string()
    .max(255, "Location must not exceed 255 characters")
    .optional(),
});

const updateSubstationStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive must be a boolean",
  }),
});

export const SubstationValidation = {
  createSubstationSchema,
  updateSubstationSchema,
  updateSubstationStatusSchema,
};