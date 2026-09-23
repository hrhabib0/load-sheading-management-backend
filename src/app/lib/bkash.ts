import httpStatus from "http-status";

import { redisClient } from "./redis.js";
import config from "../config/index.js";
import { AppError } from "../errors/AppError.js";


const BKASH_ID_TOKEN_KEY = "bkash:idToken";
const BKASH_REFRESH_TOKEN_KEY = "bkash:refreshToken";

const ID_TOKEN_TTL = 60 * 60;
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 28;

const TOKEN_REFRESH_THRESHOLD = 600;


interface IBkashCreatePaymentPayload {
    amount: string;
    intent: string;
    currency: string;
    merchantInvoiceNumber: string;
    callbackURL: string;
}


/*
 * Safely parse bKash response.
 *
 * We don't directly use response.json()
 * because an empty/non-JSON response can cause:
 *
 * Unexpected end of JSON input
 */
const parseBkashResponse = async (
    response: Response,
) => {
    const responseText = await response.text();

    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            "Invalid response received from bKash",
        );
    }
};


/*
 * Get bKash ID token.
 *
 * Flow:
 *
 * Redis ID Token
 *      ↓
 * still valid?
 *      ↓
 * return it
 *
 * Otherwise:
 *
 * Redis Refresh Token
 *      ↓
 * refresh ID Token
 *
 * If refresh token is unavailable:
 *
 * bKash Grant Token API
 */
export const getBkashGrantToken = async () => {
    let bkashIdToken =
        await redisClient.get(
            BKASH_ID_TOKEN_KEY,
        );

    const bkashIdTokenTTL =
        await redisClient.ttl(
            BKASH_ID_TOKEN_KEY,
        );

    const bkashRefreshToken =
        await redisClient.get(
            BKASH_REFRESH_TOKEN_KEY,
        );

    const bkashRefreshTokenTTL =
        await redisClient.ttl(
            BKASH_REFRESH_TOKEN_KEY,
        );


    /*
     * Existing ID token is still valid.
     */
    if (
        bkashIdToken &&
        bkashIdTokenTTL > TOKEN_REFRESH_THRESHOLD
    ) {
        return bkashIdToken;
    }


    /*
     * Try to refresh the ID token
     * using the refresh token.
     */
    if (
        bkashRefreshToken &&
        bkashRefreshTokenTTL > TOKEN_REFRESH_THRESHOLD
    ) {
        const refreshTokenResponse =
            await fetch(
                `${config.bkash_base_url}/tokenized/checkout/token/refresh`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept:
                            "application/json",
                        username:
                            config.bkash_username,
                        password:
                            config.bkash_password,
                    },

                    body: JSON.stringify({
                        app_key:
                            config.bkash_app_key,
                        app_secret:
                            config.bkash_app_secret,
                        refresh_token:
                            bkashRefreshToken,
                    }),
                },
            );


        const refreshTokenResult =
            await parseBkashResponse(
                refreshTokenResponse,
            );


        if (!refreshTokenResponse.ok) {
            throw new AppError(
                httpStatus.BAD_GATEWAY,
                refreshTokenResult?.statusMessage ||
                refreshTokenResult?.message ||
                "bKash token refresh failed",
            );
        }


        if (
            !refreshTokenResult?.id_token
        ) {
            throw new AppError(
                httpStatus.BAD_GATEWAY,
                "bKash ID token is missing from refresh response",
            );
        }


        bkashIdToken = refreshTokenResult.id_token;


        await redisClient.set(
            BKASH_ID_TOKEN_KEY,
            refreshTokenResult.id_token,
            {
                expiration: {
                    type: "EX",
                    value: ID_TOKEN_TTL,
                },
            },
        );


        /*
         * Some bKash responses may also
         * return a new refresh token.
         */
        if (
            refreshTokenResult.refresh_token
        ) {
            await redisClient.set(
                BKASH_REFRESH_TOKEN_KEY,
                refreshTokenResult.refresh_token,
                {
                    expiration: {
                        type: "EX",
                        value: REFRESH_TOKEN_TTL,
                    },
                },
            );
        }


        return bkashIdToken;
    }


    /*
     * No valid token available.
     * Request a new ID token.
     */
    const response = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/token/grant`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
                Accept:
                    "application/json",
                username: config.bkash_username,
                password: config.bkash_password,
            },

            body: JSON.stringify({
                app_key:
                    config.bkash_app_key,
                app_secret:
                    config.bkash_app_secret,
            }),
        },
    );


    const result = await parseBkashResponse(response);


    /*
     * Useful debugging information.
     *
     * We don't print credentials or tokens.
     */
    if (!response.ok) {
        console.error(
            "bKash token grant failed:",
            {
                status: response.status,
                statusText:
                    response.statusText,
                response: result,
            },
        );

        throw new AppError(
            httpStatus.BAD_GATEWAY,
            result?.statusMessage ||
            result?.message ||
            `bKash access token grant failed with status ${response.status}`,
        );
    }


    if (!result?.id_token) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            "bKash ID token is missing",
        );
    }


    /*
     * Save ID token.
     */
    await redisClient.set(
        BKASH_ID_TOKEN_KEY,
        result.id_token,
        {
            expiration: {
                type: "EX",
                value: ID_TOKEN_TTL,
            },
        },
    );


    /*
     * Save refresh token.
     */
    if (result.refresh_token) {
        await redisClient.set(
            BKASH_REFRESH_TOKEN_KEY,
            result.refresh_token,
            {
                expiration: {
                    type: "EX",
                    value: REFRESH_TOKEN_TTL,
                },
            },
        );
    }


    return result.id_token;
};


/*
 * Create bKash Payment
 */
export const createBkashPayment = async (
    payload: IBkashCreatePaymentPayload,
) => {
    const idToken =
        await getBkashGrantToken();


    if (!idToken) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            "No bKash access token found",
        );
    }


    const response = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/create`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
                Accept:
                    "application/json",
                Authorization:
                    idToken,
                "X-App-Key":
                    config.bkash_app_key,
            },

            body: JSON.stringify({
                mode: "0011",
                payerReference: "customer",
                callbackURL:
                    payload.callbackURL,
                amount:
                    payload.amount,
                currency:
                    payload.currency,
                intent:
                    payload.intent,
                merchantInvoiceNumber:
                    payload.merchantInvoiceNumber,
            }),
        },
    );


    const result =
        await parseBkashResponse(response);


    if (!response.ok) {
        console.error(
            "bKash create payment failed:",
            {
                status: response.status,
                statusText:
                    response.statusText,
                response: result,
            },
        );

        throw new AppError(
            httpStatus.BAD_GATEWAY,
            result?.statusMessage ||
            result?.message ||
            "bKash payment creation failed",
        );
    }


    /*
     * bKash normally returns statusCode
     * for business-level errors.
     */
    if (
        result?.statusCode &&
        result.statusCode !== "0000"
    ) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            result.statusMessage ||
            "bKash payment creation failed",
        );
    }


    if (
        !result?.paymentID ||
        !result?.bkashURL
    ) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            "Invalid response received from bKash payment creation",
        );
    }


    return result;
};


/*
 * Execute bKash Payment
 */
export const executeBkashPayment = async (
    paymentId: string,
) => {
    const idToken =
        await getBkashGrantToken();


    if (!idToken) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            "No bKash access token found",
        );
    }


    const response = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/execute`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
                Accept:
                    "application/json",
                Authorization:
                    idToken,
                "X-App-Key":
                    config.bkash_app_key,
            },

            body: JSON.stringify({
                paymentID: paymentId,
            }),
        },
    );


    const result =
        await parseBkashResponse(response);


    if (!response.ok) {
        console.error(
            "bKash execute payment failed:",
            {
                status: response.status,
                statusText:
                    response.statusText,
                response: result,
            },
        );

        throw new AppError(
            httpStatus.BAD_GATEWAY,
            result?.statusMessage ||
            result?.message ||
            "bKash payment execution failed",
        );
    }


    if (
        result?.statusCode &&
        result.statusCode !== "0000"
    ) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            result.statusMessage ||
            "bKash payment execution failed",
        );
    }


    return result;
};