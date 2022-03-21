import { logger } from "@app/util/logger";
import stripe from "@app/util/ssr/stripe";
import { Stripe } from "stripe";

/**
 * Get a Stripe promo code via ID.
 *
 * @param id promo code ID
 * @returns Stripe promotion code
 */
export async function getPromoCodeById(id: string): Promise<Stripe.PromotionCode | undefined> {
    try {
        const promoCode: Stripe.Response<Stripe.PromotionCode> = await stripe.promotionCodes.retrieve(id);
        return promoCode;
    } catch (e) {
        logger.error('Error getting Stripe promo code.', { error: e, id });
        return undefined;
    }
}

export function isPromoCodeRedeemed(promoCode: Stripe.PromotionCode): boolean {
    // Stripe sets the promo code to inactive once it has met the max_redemptions setting (which for gifts is 1).
    return promoCode.active === false;
}
