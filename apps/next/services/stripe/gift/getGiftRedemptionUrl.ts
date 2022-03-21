import { giftRedemptionLinkQueryParamName } from "./constants";

export function getGiftRedemptionUrl(giftId: string): string {
    return `${process.env.NEXTAUTH_URL}/redeem?${giftRedemptionLinkQueryParamName}=${giftId}`;
}
