import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { Stripe } from 'stripe';
import { twitchAxios } from '../axios';
import { logger } from '../logger';
import { SimpleResponse } from '../simpleResponse';
import prisma from '../ssr/prisma';
import stripe from '../ssr/stripe';
import { PartnerMediaKit } from './mediaKit';
import { MediaKitImage } from '@app/services/partner/types';

export const createNewPromoCode = async (partnerId: string, partnerCode: string): Promise<SimpleResponse> => {
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
    } catch (error) {
        const e = error as Stripe.StripeError;
        if ((e as Stripe.StripeError).type === 'StripeInvalidRequestError') {
            logger.error(`Error creating new promo code for partner ${partnerId}`, { error: { message: e.message, status: e.statusCode } });
            return {
                status: 400,
                message: (e as Stripe.StripeInvalidRequestError).message,
            };
        }
    }
    return {
        status: 200,
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

export const mediaKitGenerationHelper = async (partnerId: string, partnerCode: string, mediaKitImageList?: string[]): Promise<void> => {
    const partnerUserId = await prisma.partnerInformation.findUnique({
        where: {
            partnerId: partnerId,
        },
        select: {
            userId: true,
        },
    });

    let twitchId = undefined;
    let twitterUsername = undefined;
    if (partnerUserId !== null) {
        const twitchAccount = await prisma.account.findFirst({
            where: {
                userId: partnerUserId.userId,
                provider: 'twitch',
            },
        });
        if (twitchAccount !== null) {
            twitchId = twitchAccount.providerAccountId;
        }
        const twitterDisplayName = await prisma.user.findUnique({
            where: {
                id: partnerUserId.userId,
            },
            select: {
                name: true,
            },
        });
        if (twitterDisplayName !== null) {
            twitterUsername = twitterDisplayName.name;
        }
    }

    if (twitchId !== undefined && twitterUsername !== undefined) {
        const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
        const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchId}`);
        const twitchUsername = userResponse.data?.data?.[0].login;
        if (twitchUsername) {
            const partnerMediaKit: PartnerMediaKit = new PartnerMediaKit(partnerUserId.userId, partnerCode, twitchUsername, twitterUsername);
            await partnerMediaKit.generateMediaKit(partnerId, mediaKitImageList as MediaKitImage[]);
            console.log('success generating media kit');
        }
    } else {
        console.log(`twitchid: ${twitchId}\ttwitterusername: ${twitterUsername}`);
        // logger.error('Unable to generate the media kit for partner. TwitchId or twitter username undefined. ', { twitchId: twitchId, twitterUsername: twitterUsername });
    }
};

export const upsertMediaKitEntry = async (partnerId: string, failedImageRendering: string[]) => {
    await prisma.partnerMediaKit.upsert({
        where: {
            partnerId: partnerId,
        },
        create: {
            partnerId: partnerId,
            failedImageRendering: failedImageRendering,
        },
        update: {
            failedImageRendering: failedImageRendering,
        },
    });
};
