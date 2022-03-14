import stripe from '@app/util/ssr/stripe';
import { GiftPurchase } from '@prisma/client';
import Stripe from 'stripe';
import { sendMessage } from '../discord/sendMessage';
import { logger } from '../logger';
import prisma from '../ssr/prisma';

/**
 * @param giftCouponId ID of coupon associated with the gift purchased
 * @param amountTotal
 * @param userId userId of the user who purchased the gift
 * @returns gift purchase object, or undefined if it failed
 */
export async function handleGiftPurchase(giftCouponId: string, amountTotal: number, userId: string, customerEmail: string, priceId: string, checkoutSessionId: string, index: number): Promise<GiftPurchase | undefined> {
    const promoCode: Stripe.PromotionCode | undefined = await generateStripePromoCode(giftCouponId);
    if (promoCode !== undefined) {
        // if the promoCode was created, we add it to the db
        const giftPurchase = await prisma.giftPurchase.create({
            data: {
                promoCodeId: promoCode.id,
                promoCodeCode: promoCode.code,
                purchaserUserId: userId,
                purchaserEmail: customerEmail,
                priceId,
                checkoutSessionId,
                index
            },
        });
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        const msg = `${user.name} purchased a gift of ${amountTotal * 0.01}.`;
        logger.info(msg, { userId: userId });
        sendMessage(`${msg}`, process.env.DISCORD_GIFT_PURCHASED_URL);
        return giftPurchase;
    } else {
        const msg = 'A gift was successfully purchased, but promoCode for gift was not created successfully.';
        logger.warn(msg, { giftCouponId: giftCouponId });
        sendMessage(`${msg} Coupon id: ${giftCouponId}`, process.env.DISCORD_GIFT_PURCHASED_URL);
    }
};

/**
 * Create a stripe promo code for a specific coupon
 *
 * @param couponId ID of coupon to create new promo code for
 * @returns ID of the created promo code, or undefined if it failed
 */
async function generateStripePromoCode(couponId: string): Promise<Stripe.PromotionCode | undefined> {
    try {
        const promoCode = await stripe.promotionCodes.create({ coupon: couponId, max_redemptions: 1 });
        return promoCode;
    } catch (err) {
        logger.error('Error creating promotion code for coupon.', { error: err, coupon: couponId });
    }
    return undefined;
};
