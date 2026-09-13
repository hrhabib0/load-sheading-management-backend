import z from "zod";
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../errors/AppError.js";
import httpStatus from "http-status";


export const validateRequest = (zodSchema: z.ZodObject) => {
    return catchAsync(async (req, res, next) => {
        const payload = req.body ? req.body : {};

        const result = zodSchema.safeParse(payload);

        if (!result.success) {
            console.log(result.error);
            console.log(result.error.issues);
            throw new AppError(httpStatus.BAD_REQUEST, result.error.issues[0].message)
        }
        req.body = result.data;

        next();
    })
}