import env from "@app/util/env";
import { logger } from "@app/util/logger";
import { SimpleResponse } from "@app/util/simpleResponse";
import prisma from "@app/util/ssr/prisma";
import stripe from "@app/util/ssr/stripe";
import { PartnerInvoice } from "@prisma/client";
import Stripe from "stripe";

export class PartnerService {

    public static async createNewPromoCode(partnerId: string, partnerCode: string): Promise<SimpleResponse> {
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
    public static async updatePromoCodeStatus(partnerId: string, status: boolean): Promise<number> {
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

    public static async getPartnerInvoice(invoiceId: string): Promise<PartnerInvoice | undefined>  {
        const partnerInvoice = await prisma.partnerInvoice.findUnique({
            where: {
                id: invoiceId,
            }
        });

        if (partnerInvoice === null || partnerInvoice.partnerId === null || partnerInvoice.commissionAmount === null) {
            return undefined;
        }

        return partnerInvoice;
    };

    public static async getPartnerInfo(partnerId: string): Promise<string | undefined> {
        // get their userId
        const partnerInfo = await prisma.partnerInformation.findUnique({
            where: {
                partnerId: partnerId,
            },
            select: {
                userId: true,
            },
        });

        if (partnerInfo === null) {
            return undefined;
        }

        return partnerInfo.userId;
    };

    public static async getPartnerCustomerInfo(userId: string): Promise<string | undefined> {
        // get the customerId
        const customerId = await prisma.customer.findUnique({
            where: {
                userId: userId,
            },
            select: {
                id: true,
            },
        });

        if (customerId === null) {
            return undefined;
        }

        return customerId.id;
    };

    public static async setBalanceTransactionId(invoiceId: string, balanceTransactionId: string) {
        // update the commission status
        await prisma.partnerInvoice.update({
            where: {
                id: invoiceId,
            },
            data: {
                commissionStatus: 'complete',
                balanceTransactionId,
            },
        });
    };

    public static async updateRejectedPayoutStatus(invoiceId: string) {
        await prisma.partnerInvoice.update({
            where: {
                id: invoiceId,
            },
            data: {
                commissionStatus: 'rejected',
            },
        });
    };
}
