import Stripe from 'stripe';
import prisma from '../ssr/prisma';
import stripe from '../ssr/stripe';
import { InvoiceInformation } from './types';

export const getInvoiceInformation = async (data: Stripe.Invoice): Promise<InvoiceInformation> => {
    const invoiceId = data.id;

    const stripePromoCode = data.discount?.promotion_code?.toString() ?? undefined;
    const paidAt = new Date(data.status_transitions.paid_at * 1000); // date object is in milliseconds and timestamp is in seconds

    const productId = data.lines.data[0]?.plan?.id ?? undefined;

    const customerId = data.customer.toString();

    const priceId = data.lines.data[0]?.price.id ?? undefined;
    const purchaseAmount = data.subtotal;

    const planBaseAmount = data.lines.data[0]?.price.unit_amount;

    const metadata = data.metadata;

    const status = data.status;

    const stripeProducts = await stripe.products.list();
    const giftProducts = stripeProducts.data.filter((product) => product.name.includes('Gift')).map((product) => product.id);

    return {
        invoiceId: invoiceId,
        stripePromoCode: stripePromoCode,
        paidAt: paidAt,
        productId: productId,
        customerId: customerId,
        priceId: priceId,
        purchaseAmount: purchaseAmount,
        planBaseAmount: planBaseAmount,
        giftProducts: giftProducts,
        metadata: metadata,
        status: status,
    };
};

export const updateInvoiceTables = async (invoiceInfo: InvoiceInformation, partnerId: string | undefined, commissionAmount: number) => {
    // add info to invoice's table
    await prisma.invoice.create({
        data: {
            id: invoiceInfo.invoiceId,
            customerId: invoiceInfo.customerId,
            promoCodeId: invoiceInfo.stripePromoCode,
            productId: invoiceInfo.productId,
            purchaseAmount: invoiceInfo.purchaseAmount,
            priceId: invoiceInfo.priceId,
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
