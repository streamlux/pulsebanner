import stripe from '@app/util/ssr/stripe';
import { GiftStatus } from '@prisma/client';
import { sendMessage } from '../discord/sendMessage';
import { logger } from '../logger';
import prisma from '../ssr/prisma';
import { InvoiceInformation } from './types';

const generateStripePromoCode = async (couponId: string): Promise<string | undefined> => {
    try {
        const promoCode = await stripe.promotionCodes.create({ coupon: couponId });
        return promoCode.code;
    } catch (err) {
        logger.error('Error generating the user promoCode for the given coupon.', { error: err, coupon: couponId });
    }
    return undefined;
};

export const handleStripePromoCode = async (giftCouponId: string, invoiceInfo: InvoiceInformation, customerInfo: { userId: string }) => {
    const promoCode = await generateStripePromoCode(giftCouponId);
    if (promoCode !== undefined) {
        // if the promoCode was created, we add it to the db
        await prisma.giftPurchase.create({
            data: {
                id: invoiceInfo.invoiceId,
                promoIdCreated: promoCode,
                purchaserUserId: 'customerInfo.userId',
                giftStatus: GiftStatus.Valid,
            },
        });
        const user = await prisma.user.findUnique({
            where: {
                id: customerInfo.userId,
            },
        });
        const msg = `${user.name} purchased a gift of ${invoiceInfo.planBaseAmount * 0.01}.`;
        logger.info(msg, { userId: customerInfo.userId });
        sendMessage(`${msg}`, process.env.DISCORD_GIFT_PURCHASED_URL);
    } else {
        logger.warn('A gift was successfully purchased, but promoCode for gift was not created successfully.', { giftCouponId: giftCouponId });
        sendMessage(`A gift was successfully purchased, but promoCode for gift was not created successfully. Coupon id: ${giftCouponId}`, process.env.DISCORD_GIFT_PURCHASED_URL);
    }
};
