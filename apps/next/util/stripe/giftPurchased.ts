import stripe from '@app/util/ssr/stripe';
import { sendMessage } from '../discord/sendMessage';
import { logger } from '../logger';
import prisma from '../ssr/prisma';

/**
 * @param giftCouponId ID of coupon associated with the gift purchased
 * @param amountTotal
 * @param userId userId of the user who purchased the gift
 * @returns ID of the created stripe promo code, or undefined if it failed
 */
export async function handleStripePromoCode(giftCouponId: string, amountTotal: number, userId: string): Promise<string | undefined> {
    const promoCode: string | undefined = await generateStripePromoCode(giftCouponId);
    if (promoCode !== undefined) {
        // if the promoCode was created, we add it to the db
        await prisma.giftPurchase.create({
            data: {
                promoCodeCreated: promoCode,
                purchaserUserId: userId,
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
    } else {
        logger.warn('A gift was successfully purchased, but promoCode for gift was not created successfully.', { giftCouponId: giftCouponId });
        sendMessage(`A gift was successfully purchased, but promoCode for gift was not created successfully. Coupon id: ${giftCouponId}`, process.env.DISCORD_GIFT_PURCHASED_URL);
    }
    return promoCode;
};

/**
 * Create a stripe promo code for a specific coupon
 *
 * @param couponId ID of coupon to create new promo code for
 * @returns ID of the created promo code, or undefined if it failed
 */
 async function generateStripePromoCode(couponId: string): Promise<string | undefined> {
    try {
        const promoCode = await stripe.promotionCodes.create({ coupon: couponId, max_redemptions: 1 });
        return promoCode.code;
    } catch (err) {
        logger.error('Error creating promotion code for coupon.', { error: err, coupon: couponId });
    }
    return undefined;
};
