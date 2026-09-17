export interface IUpdateCustomerPayload {
    name?: string;
    phone?: string;
}

export interface IUpdateCustomerByStaffPayload {
    name?: string;
    phone?: string;
    areaId?: string;
    priorityId?: string;
}

export interface IUpdateCustomerStatusPayload {
    isActive: boolean;
}