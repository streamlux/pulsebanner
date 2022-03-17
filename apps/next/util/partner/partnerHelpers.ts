import { Stripe } from 'stripe';
import env from '../env';
import { logger } from '../logger';
import { SimpleResponse } from '../simpleResponse';
import prisma from '../ssr/prisma';
import stripe from '../ssr/stripe';

export const createNewPromoCode = async (partnerId: string, partnerCode: string): Promise<SimpleResponse> => {
    try {
        const promotionCodeResponse = await stripe.promotionCodes.create({ coupon: env.STRIPE_AFFILIATE_COUPON, code: partnerCode });
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
    } catch (error) {
        const e = error as Stripe.StripeError;
        if ((e as Stripe.StripeError).type === 'StripeInvalidRequestError') {
            logger.error(`Error creating new promo code for partner ${partnerId}`, { error: { message: e.message, status: e.statusCode } });
            return {
                status: 400,
                message: (e as Stripe.StripeInvalidRequestError).message
            };
        }
    }
    return {
        status: 200
    };
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
