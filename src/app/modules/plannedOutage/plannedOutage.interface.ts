export interface ICreatePlannedOutagePayload {
    title: string;
    description?: string;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    feederIds: string[];
}

export interface IUpdatePlannedOutagePayload {
    title?: string;
    description?: string;
    scheduledStartAt?: Date;
    scheduledEndAt?: Date;
    feederIds?: string[];
}

export interface ICancelPlannedOutagePayload {
    cancellationReason: string;
}