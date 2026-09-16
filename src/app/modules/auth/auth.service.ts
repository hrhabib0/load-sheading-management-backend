import bcrypt from "bcryptjs";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { ILoginUserPayload, IRegisterUserPayload, IVerifyEmailPayload } from "./auth.interface.js";
import httpStatus from "http-status";
import config from "../../config/index.js";
import crypto from "crypto";
import { redisClient } from "../../lib/redis.js";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodeMailer.js";
import { jwtUtils } from "../../utils/jwt.js";
import { JwtPayload, SignOptions } from "jsonwebtoken";



const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password, phone, areaId, priorityId } = payload;

    // 1. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
    }

    // 2. Check whether area exists
    const area = await prisma.area.findUnique({
        where: {
            id: areaId,
        },
    });

    if (!area) {
        throw new AppError(httpStatus.NOT_FOUND, "Area not found");
    }

    // 3. Check whether priority exists
    const priority = await prisma.customerPriority.findUnique({
        where: {
            id: priorityId,
        },
    });

    if (!priority) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer priority not found");
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    // set/send otp and user data to redis
    const otpValue = crypto.randomInt(100000, 1000000);
    const otpKey = `email-verification-otp:${email}`;
    const expirationSeconds = 5 * 60;
    await redisClient.set(otpKey, otpValue.toString(), {
        expiration: {
            type: "EX",
            value: expirationSeconds,
        },
    });

    const userRegistrationKey = `user-registration-data:${email}`;
    const redisUserDataPayload = {
        name,
        email,
        phone,
        areaId,
        priorityId,
        password: hashedPassword,
    };
    await redisClient.set(
        userRegistrationKey,
        JSON.stringify(redisUserDataPayload),
        {
            expiration: {
                type: "EX",
                value: expirationSeconds,
            },
        },
    );

    // send email to the use
    const templatePath = path.join(
        process.cwd(),
        "src/app/templates/email-verification.ejs",
    );
    const templateData = {
        name,
        otp: otpValue,
        expirationTime: expirationSeconds / 60,
    };
    const html = await ejs.renderFile(templatePath, templateData);
    await transporter.sendMail({
        from: config.email_sender,
        to: email,
        subject: "Email Verification",
        html,
    });

};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
    const { email, otp } = payload;

    // 1. Get stored OTP from Redis
    const otpKey = `email-verification-otp:${email}`;

    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "OTP is invalid or has expired",
        );
    }

    // 2. Compare OTP
    if (storedOtp !== otp) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Invalid OTP",
        );
    }

    // 3. Get temporary registration data
    const userRegistrationKey = `user-registration-data:${email}`;

    const registrationData = await redisClient.get(userRegistrationKey);

    if (!registrationData) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Registration data is missing or has expired",
        );
    }

    const userData = JSON.parse(registrationData);

    // 4. Double-check email is not already registered
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new AppError(
            httpStatus.CONFLICT,
            "User already exists with this email",
        );
    }

    // 5. Create User + CustomerProfile in a transaction
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: "CUSTOMER",
                isActive: true,
            },
            omit: {
                password: true
            }
        });

        const customerProfile = await tx.customerProfile.create({
            data: {
                userId: user.id,
                areaId: userData.areaId,
                priorityId: userData.priorityId,
            },
        });

        return {
            user,
            customerProfile,
        };
    });

    // 6. Delete temporary Redis data
    await redisClient.del(otpKey);
    await redisClient.del(userRegistrationKey);

    const { user, customerProfile } = result;

    // 7. Return safe response
    return {
        user,
        customerProfile
    };
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    // 1. Find user 
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not found.");
    }

    // 2. Check whether account is active 
    if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "Your account is inactive",);
    }

    // 3. Compare password
    const isPasswordMatched = await bcrypt.compare(password, user.password,);
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password",);
    }

    // 4. Create access token
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    )
    // 5. Create refresh token
    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    )
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    };
};

const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found",
        );
    }

    return user;
};

const refreshAccessToken = async (token: string) => {
    // step-1: verify refresh token. if not verified then throw an error message
    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Refresh Token is required.");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);
    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            config.node_env === "development"
                ? verifiedRefreshToken.error
                : "Invalid refresh token",
        )
    }

    // step-2: get data from refresh token
    const data = verifiedRefreshToken.data as JwtPayload;

    // step-3: find user from DB and check user's status
    const user = await prisma.user.findUnique({
        where: {
            id: data.userId
        },
        omit: {
            password: true
        }
    });
    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found",
        );
    }
    if (!user.isActive) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Your account is inactive",
        );
    }

    // step-4: create jwtPayload and generate new accessToken, refreshToken.
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );
    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    // step-5: return new accessToken and refreshToken
    return {
        accessToken,
        refreshToken,
    };
}


export const AuthServices = {
    registerUser,
    verifyUserEmail,
    loginUser,
    getMe,
    refreshAccessToken,
};