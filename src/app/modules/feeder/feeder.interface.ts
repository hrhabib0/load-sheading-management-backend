export interface ICreateFeederPayload {
    substationId: string;
    name: string;
    code: string;
    description?: string;
}

export interface IUpdateFeederPayload {
    name?: string;
    code?: string;
    description?: string;
}

export interface IUpdateFeederStatusPayload {
    isActive: boolean;
}