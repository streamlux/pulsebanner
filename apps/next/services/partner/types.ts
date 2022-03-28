export type PartnerCreateType = {
    email: string;
    firstName: string;
    lastName?: string;
    partnerCode: string;
    notes?: string;
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

export type StandardForegroundProps = {
    discountCode: string;
    twitchUsername: string;
    twitterUsername: string;
};

export type StandardBackgroundProps = {
    src: string; // background image url
};

export enum MediaKitImage {
    BasicPartnerImageWithCode = 'BasicPartnerImageWithCode',
    PartnerCodeWithMembershipImage = 'PartnerCodeWithMembershipImage',
}

export enum BackgroundImageId {
    ImageBackground = 'ImageBackground',
}

export type PartnerRemotionRequestBody = {
    foregroundId: MediaKitImage;
    backgroundId: BackgroundImageId;
    foregroundProps: StandardForegroundProps;
    backgroundProps: StandardBackgroundProps;
};

export type PartnerRemotionRequestBodyWithUserId = PartnerRemotionRequestBody & { userId: string };

export type PartnerMediaKitMap = Record<MediaKitImage, PartnerRemotionRequestBody>;
