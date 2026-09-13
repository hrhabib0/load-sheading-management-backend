import { UserRole } from "../../generated/prisma/enums.js";
import { AppError } from "../errors/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string,
                name: string,
                userId: string,
                role: UserRole
            }
        }
    }
}

export const auth = (...requiredRoles: UserRole[]) => {
    return catchAsync(async (req, res, next) => {
        // get token from req.cookies or req.headers
        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization.split(" "[1])
                :
                req.headers.authorization;

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in.")
        }

        // verify token
        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {
            throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error)
        }

        const { name, email, role, userId } = verifiedToken.data as JwtPayload

        // check user's role and if user is unauthorized then stop here with erro.
        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to access this  resource.");
        }

        // find user from DB and check some status
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                email,
                name,
                role
            }
        });

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        if (!user.isActive) {
            throw new AppError(httpStatus.FORBIDDEN, "Your account is not active. Please contact with support team.")
        }

        // set user data into req.user
        req.user = {
            email,
            name,
            userId,
            role
        }


        // after all of this, send to the next middleware.
        next();
    })
}