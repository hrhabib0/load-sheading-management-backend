import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { PaymentServices } from "./payment.service.js";
import { AppError } from "../../errors/AppError.js";



const createPayment = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;
        const payload = req.body;

        const result = await PaymentServices.createPayment(
            user,
            payload,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Payment initiated successfully",
            data: result,
        });
    },
);

const bkashCallback = catchAsync(
    async (req: Request, res: Response) => {
        console.log("handle is oke", req.query)
        const paymentID = String(req.query.paymentID);
        const status = req.query.status
            ? String(req.query.status)
            : undefined;

        const { redirectUrl } = await PaymentServices.handleBkashCallback(
            paymentID,
            status,
        );
        console.log(redirectUrl, "result url is ok")
        res.redirect(redirectUrl);
    },
);


export const PaymentControllers = {
    createPayment,
    bkashCallback,
};