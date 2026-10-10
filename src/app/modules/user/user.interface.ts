export interface IGetAllUsersQuery {
    page: number;
    limit: number;
    search?: string;
    role?: "CUSTOMER" | "TECHNICIAN" | "POWER_OPERATOR" | "ZONE_MANAGER" | "ADMIN";
    isActive?: boolean;
}