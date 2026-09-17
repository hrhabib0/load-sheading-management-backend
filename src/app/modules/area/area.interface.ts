export interface ICreateAreaPayload {
    feederId: string;
    name: string;
    code: string;
    description?: string;
}

export interface IUpdateAreaPayload {
    name?: string;
    code?: string;
    description?: string;
}

export interface IUpdateAreaStatusPayload {
    isActive: boolean;
}