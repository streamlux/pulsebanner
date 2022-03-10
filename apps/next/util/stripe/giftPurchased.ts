import stripe from '@app/util/ssr/stripe';
import { sendMessage } from '../discord/sendMessage';
import { logger } from '../logger';
import prisma from '../ssr/prisma';

const generateStripePromoCode = async (couponId: string): Promise<string | undefined> => {
    try {
        const promoCode = await stripe.promotionCodes.create({ coupon: couponId });
        return promoCode.code;
    } catch (err) {
        logger.error('Error generating the user promoCode for the given coupon.', { error: err, coupon: couponId });
    }
    return undefined;
};

export const handleStripePromoCode = async (giftCouponId: string, amountTotal: number, userId: string): Promise<string | undefined> => {
    const promoCode = await generateStripePromoCode(giftCouponId);
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
