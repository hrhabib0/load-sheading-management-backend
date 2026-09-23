
export interface ICreateWorkTaskPayload {
    incidentId: string;
    title: string;
    description?: string;
}

export interface IAssignWorkTaskPayload {
    technicianId: string;
}

export interface IRejectWorkTaskPayload {
    rejectionReason: string;
}

export interface IFailWorkTaskPayload {
    failureReason: string;
}

export interface ICompleteWorkTaskPayload {
    repairNote: string;
}