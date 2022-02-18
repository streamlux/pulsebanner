// we will listen to all stripe webhooks for the partner program here

import { logger } from '@app/util/logger';
import { commissionLookupMap } from '@app/util/partner/constants';
import { createApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buffer(readable: any) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

/**
 * What needs to be done:
 * 1. If the invoice succeeded, we give them 10% off for the first month.
 * 2. After it succeeds and we get the coupon code, we need to see who it is associated with.
 * 3. Apply the designated discount value to the referrer's account for the next month.
 * 4. If the user that used the code cancels their subscription in the first month (i.e. we don't get the payment), we need to also cancel applying the discount code
 */

const relevantEvents = new Set(['invoice.payment_succeeded']);

const handler = createApiHandler();

// define the commission values in a type here

handler.post(async (req, res) => {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        logger.error(`❌ Error verifying webhook. Message: ${err?.message}`);
        logger.error('secret', process.env.STRIPE_WEBHOOK_SECRET);
        return res.status(400).send(`Webhook Error: ${err?.message}`);
    }

    if (relevantEvents.has(event.type)) {
        try {
            switch (event.type) {
                case 'invoice.payment_succeeded': {
                    const data = event.data.object as Stripe.Invoice;
                    const invoiceId = data.id;
                    // const couponId = data.discount?.coupon?.id ?? undefined;
                    const stripePromoCode = data.discount?.promotion_code?.toString() ?? undefined;
                    const paidAt = new Date(data.status_transitions.paid_at);

                    // we want the priceId so we can apply the correct discount
                    const priceId = data.lines.data[0]?.price.id ?? undefined;
                    const purchaseAmount = data.subtotal;

                    // we need a way to get the partner (if they exist)
                    // lookup the couponId associated with the person
                    let partnerId = undefined;
                    if (stripePromoCode) {
                        const partnerInfo = await prisma.stripePartnerInfo.findUnique({
                            where: {
                                stripePromoCode: stripePromoCode,
                            },
                        });

                        if (partnerInfo !== null) {
                            partnerId = partnerInfo.partnerId;
                        }
                    }

                    // please note to be in accordance with stripe, commission is stored as cents (100 = $1)
                    let commissionAmount = 0.00;
                    if (priceId) {
                        commissionAmount = commissionLookupMap[priceId] * 100 ?? 0.00;
                    }

                    // update the PartnerInvoices table
                    await prisma.partnerInvoice.create({
                        data: {
                            invoiceId: invoiceId,
                            paidAt: paidAt,
                            partnerId: partnerId,
                            commissionAmount: commissionAmount,
                            commissionStatus: stripePromoCode === undefined ? 'none' : 'pending',
                            purchaseAmount: purchaseAmount,
                        },
                    });
                }
            }
        } catch (e) {
            console.log('eer: ', e);
        }
    }
});
