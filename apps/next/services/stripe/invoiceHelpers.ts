/* eslint-disable @typescript-eslint/no-non-null-assertion */
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';
import Stripe from 'stripe';
import { InvoiceInformation } from './types';

export const getInvoiceInformation = async (data: Stripe.Invoice): Promise<InvoiceInformation> => {
    const stripePromoCode = data.discount?.promotion_code?.toString() ?? undefined;
    const paidAt = new Date(data.status_transitions.paid_at! * 1000); // date object is in milliseconds and timestamp is in seconds

    const productId = data.lines.data[0]?.plan?.id ?? undefined;
    const priceId = data.lines.data[0]?.price?.id ?? undefined;

    const planBaseAmount = data.lines.data[0]?.price!.unit_amount;

    const stripeProducts = await stripe.products.list();
    const giftProducts = stripeProducts.data.filter((product) => product.name.includes('Gift')).map((product) => product.id);

    const customerId = data.customer as string;
    return {
        invoiceId: data.id,
        stripePromoCode: stripePromoCode,
        paidAt: paidAt,
        productId: productId,
        customerId: customerId,
        priceId: priceId,
        purchaseAmount: data.subtotal,
        planBaseAmount: planBaseAmount!,
        giftProducts: giftProducts,
        metadata: data.metadata,
        status: data.status!,
    };
};

export const updateInvoiceTables = async (invoiceInfo: InvoiceInformation, partnerId: string | undefined, commissionAmount: number) => {
    // add info to invoice's table
    await prisma.invoice.create({
        data: {
            id: invoiceInfo.invoiceId,
            customerId: invoiceInfo.customerId,
            promoCodeId: invoiceInfo.stripePromoCode!,
            productId: invoiceInfo.productId!,
            purchaseAmount: invoiceInfo.purchaseAmount,
            priceId: invoiceInfo.priceId!,
            paidAt: invoiceInfo.paidAt,
            metadata: invoiceInfo.metadata,
            status: invoiceInfo.status,
        },
    });

    // update the PartnerInvoices table
    await prisma.partnerInvoice.create({
        data: {
            id: invoiceInfo.invoiceId,
            customerId: invoiceInfo.customerId,
            paidAt: invoiceInfo.paidAt,
            partnerId: partnerId,
            commissionAmount: commissionAmount,
            commissionStatus: partnerId === null ? 'none' : 'waitPeriod',
            purchaseAmount: invoiceInfo.purchaseAmount,
        },
    });
};

export const handlePartnerUsesOwnPromoCode = async (partnerId: string, userId: string): Promise<boolean> => {
    let overrideCommissionAmount = false;
    // check the partnerInformation table and see if they are the same entry
    const partnerInfoCodeOwner = await prisma.partnerInformation.findUnique({
        where: {
            partnerId: partnerId,
        },
        select: {
            id: true,
        },
    });

    const partnerInfoCodeUser = await prisma.partnerInformation.findUnique({
        where: {
            userId: userId,
        },
        select: {
            id: true,
        },
    });

    if (partnerInfoCodeOwner !== null && partnerInfoCodeUser !== null) {
        overrideCommissionAmount = partnerInfoCodeOwner.id === partnerInfoCodeUser.id ? true : false;
    }
    return overrideCommissionAmount;
};
