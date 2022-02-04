export type PartnerCreateType = {
    email: string;
    firstName: string;
    lastName?: string;
    partnerCode: string;
    paypalEmail: string;
};

export enum AcceptanceStatus {
    Active = 'active',
    Pending = 'pending',
    Suspended = 'suspended',
    Rejected = 'rejected',
    None = 'none',
}

export type PartnerInfoType = PartnerCreateType & {
    partnerId: string;
    acceptanceStatus: AcceptanceStatus;
};
