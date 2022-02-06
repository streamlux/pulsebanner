import prisma from '../ssr/prisma';
import stripe from '../ssr/stripe';

export const createNewPromoCode = async (partnerId: string, partnerCode: string): Promise<number> => {
    try {
        const promotionCodeResponse = await stripe.promotionCodes.create({ coupon: process.env.STRIPE_AFFILIATE_COUPON, code: partnerCode });
        const promoId = promotionCodeResponse.id;

        await prisma.stripePartnerInfo.upsert({
            where: {
                partnerId: partnerId,
            },
            create: {
                stripePromoCode: promoId,
                partnerId: partnerId,
            },
            update: {
                stripePromoCode: promoId,
            },
        });
    } catch (e) {
        console.log('error creating new promo code: ', e);
        return 400;
    }
    return 200;
};

// status is just the boolean of whether to create. Has to be in active state for our partner program for it to be enabled
export const updatePromoCodeStatus = async (partnerId: string, status: boolean): Promise<number> => {
    const stripePartnerInfo = await prisma.stripePartnerInfo.findUnique({
        where: {
            partnerId: partnerId,
        },
    });

    if (stripePartnerInfo === null) {
        return 400;
    }

    const promoId = stripePartnerInfo.stripePromoCode;
    try {
        await stripe.promotionCodes.update(promoId, { active: status });
    } catch (e) {
        console.log('Error updating the promotion code: ', e);
        return 400;
    }
    return 200;
};
