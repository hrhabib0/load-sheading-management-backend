import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { UserValidation } from "./user.validate.js";
import { UserServices } from "./user.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";



const getAllUsers = catchAsync(
    async (req: Request, res: Response) => {
        const query = UserValidation.getAllUsersSchema.parse(req.query);

        const result = await UserServices.getAllUsers(query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Users retrieved successfully",
            data: result,
        });
    },
);


export const UserController = {
    getAllUsers,
}