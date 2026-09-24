import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import {
    createBkashPayment,
    executeBkashPayment,
} from "../../lib/bkash.js";

import { AppError } from "../../errors/AppError.js";
import { IUserContext } from "../auth/auth.interface.js";
import {
    ICreatePaymentPayload,
} from "./payment.interface.js";
import config from "../../config/index.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const PREMIUM_PRICE = 100;
const PREMIUM_DURATION_DAYS = 30;

const createPayment = async (
    user: IUserContext,
    payload: ICreatePaymentPayload,
) => {
    if (user.role !== UserRole.CUSTOMER) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Only customers can purchase Premium",
        );
    }

    const customer = await prisma.customerProfile.findUnique({
        where: {
            userId: user.userId,
        },
        select: {
            id: true,

            subscription: {
                select: {
                    id: true,
                    status: true,
                    expiresAt: true,
                },
            },
        },
    });

    if (!customer) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Customer profile not found",
        );
    }

    /*
     * Check active subscription.
     */

    if (
        customer.subscription?.status === "ACTIVE" &&
        customer.subscription.expiresAt > new Date()
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "You already have an active Premium subscription",
        );
    }

    /*
     * Create internal payment first.
     */

    const payment = await prisma.payment.create({
        data: {
            customerId: customer.id,
            amount: PREMIUM_PRICE,
            provider: "BKASH",
            status: "INITIATED",
        },
    });

    try {
        /*
         * Create payment in bKash.
         */

        const bkashPayment = await createBkashPayment({
            amount: PREMIUM_PRICE.toString(),
            intent: "sale",
            currency: "BDT",
            merchantInvoiceNumber: payment.id,
            callbackURL: `http://localhost:5000/api/payments/bkash/callback`,
        });

        /*
         * Save bKash payment ID.
         */

        const updatedPayment = await prisma.payment.update({
            where: {
                id: payment.id,
            },

            data: {
                paymentId: bkashPayment.paymentID,
                status: "PENDING",
            },
        });

        return {
            paymentId: updatedPayment.id,
            bkashPaymentId: updatedPayment.paymentId,
            paymentURL: bkashPayment.bkashURL,
            amount: updatedPayment.amount,
            status: updatedPayment.status,
            durationDays: PREMIUM_DURATION_DAYS,
        };
    } catch (error) {
        /*
         * bKash payment creation failed.
         * Mark our internal payment as FAILED.
         */

        await prisma.payment.update({
            where: {
                id: payment.id,
            },

            data: {
                status: "FAILED",
            },
        });

        throw error;
    }
};

const handleBkashCallback = async (
    paymentId: string,
    status?: string,
) => {
    const payment = await prisma.payment.findFirst({
        where: {
            paymentId,
        },
        select: {
            id: true,
            customerId: true,
            amount: true,
            status: true,
            paymentId: true,
        },
    });

    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment not found",
        );
    }

    /*
     * Don't process an already completed payment.
     */
    if (payment.status === "PAID") {
        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=success`,
        };
    }

    /*
     * Handle cancelled payment.
     */
    if (status === "cancel") {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "CANCELLED",
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=cancel`,
        };
    }

    /*
     * Handle failed payment.
     */
    if (status === "failure") {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=failure`,
        };
    }

    /*
     * Only execute the payment when bKash
     * callback status is successful.
     */
    if (status !== "success") {
        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=failure`,
        };
    }

    /*
     * Execute payment with bKash.
     */
    const result = await executeBkashPayment(
        paymentId,
    );

    /*
     * Verify bKash execution response.
     */
    if (result.statusCode !== "0000") {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=failure`,
        };
    }

    if (!result.trxID) {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=failure`,
        };
    }

    /*
     * Update payment and activate subscription
     * inside one database transaction.
     */
    const resultData = await prisma.$transaction(
        async (tx) => {
            const paidPayment =
                await tx.payment.update({
                    where: {
                        id: payment.id,
                    },
                    data: {
                        status: "PAID",
                        transactionId: result.trxID,
                        paidAt: new Date(),
                    },
                });

            const now = new Date();

            const expiresAt = new Date(now);

            expiresAt.setDate(
                expiresAt.getDate() +
                PREMIUM_DURATION_DAYS,
            );

            await tx.customerSubscription.upsert({
                where: {
                    customerId: payment.customerId,
                },
                update: {
                    status: "ACTIVE",
                    startedAt: now,
                    expiresAt,
                },
                create: {
                    customerId: payment.customerId,
                    status: "ACTIVE",
                    startedAt: now,
                    expiresAt,
                },
            });
            return {
                redirectUrl: `${config.frontend_url}/dashboard/my-payments?status=success`,
            };
        },
    );
    return resultData;
};

export const PaymentServices = {
    createPayment,
    handleBkashCallback,
};