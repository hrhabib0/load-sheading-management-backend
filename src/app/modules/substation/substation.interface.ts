export interface ICreateSubstationPayload {
    zoneId: string;
    name: string;
    code: string;
    location?: string;
}

export interface IUpdateSubstationPayload {
    name?: string;
    code?: string;
    location?: string;
}

export interface IUpdateSubstationStatusPayload {
    isActive: boolean;
}