import { UserRole } from "../../../generated/prisma/enums.js";

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    areaId: string;
    priorityId: string;
}

export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IUserContext {
    email: string;
    name: string;
    userId: string;
    role: UserRole;
}