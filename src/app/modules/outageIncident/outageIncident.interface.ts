export interface ICreateOutageIncidentPayload {
    feederId: string;
    description: string;
}

export interface ILinkCustomerReportPayload {
    reportId: string;
}

export interface ICloseOutageIncidentPayload {
    resolutionNote: string;
}