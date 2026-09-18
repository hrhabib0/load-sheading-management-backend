export interface ICreateLoadSheddingSchedulePayload {
    title: string;
    description?: string;
    requiredReduction?: number;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    feederIds: string[];
}

export interface IUpdateLoadSheddingSchedulePayload {
    title?: string;
    description?: string;
    requiredReduction?: number;
    scheduledStartAt?: Date;
    scheduledEndAt?: Date;
    feederIds?: string[];
}