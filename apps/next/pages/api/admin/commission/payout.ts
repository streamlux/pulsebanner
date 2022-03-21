import { PartnerService } from '@app/services/partner/PartnerService';
import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import stripe from '@app/util/ssr/stripe';
import { CommissionStatus } from '@prisma/client';
import { Stripe } from 'stripe';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(401).send('Not admin user');
    }

    const payoutStatusUpdate = req.body.payoutStatusMap as Record<string, CommissionStatus>;
    if (!payoutStatusUpdate) {
        return res.status(400).send('Payouts to update not provided in body.');
    }

    // Only do operation with stripe when it goes to completed state
    Object.keys(payoutStatusUpdate).forEach(async (invoiceId: string) => {
        try {
            /**
             * We handle pendingCompletion and pending in the same manner.
             * If it is a bulk payout, we will have things in pendingCompletion and pending.
             * We should not have anything in pending if we are doing individual payouts.
             */
            if (payoutStatusUpdate[invoiceId] === 'pendingCompletion' || payoutStatusUpdate[invoiceId] === 'pending') {
                // get the invoiceId associated with the partner
                const partnerInvoice = await PartnerService.getPartnerInvoice(invoiceId);

                if (!partnerInvoice || !partnerInvoice.partnerId) {
                    logger.info('No partner or commission amount associated with invoice: ', invoiceId);
                    return res.status(400).send(`No partner or commission amount associated with invoice: ${invoiceId}`);
                }

                const partnerUserId = await PartnerService.getPartnerInfo(partnerInvoice.partnerId);

                if (partnerUserId === undefined) {
                    logger.info('Could not find the partner info.');
                    return res.status(400).send(`No partner info found for partnerId: ${partnerInvoice.partnerId}`);
                }

                const userId = partnerUserId;

                const customerId = await PartnerService.getPartnerCustomerInfo(userId);

                if (!customerId) {
                    logger.info('Could not find the partners stripe customer info.');
                    return res.status(400).send(`Could not find the partners stripe customer info. UserId: ${userId}`);
                }

                // This is the invoiceId that we want to apply the discount to in the future
                const customerInfo = await stripe.customers.retrieve(customerId) as Stripe.Response<Stripe.Customer>;
                if (!customerInfo) {
                    return res.status(400).send('Unable to get customer info.');
                }

                const newCustomerBalance = customerInfo.balance - partnerInvoice.commissionAmount;

                const balanceTransaction = await stripe.customers.createBalanceTransaction(customerId, {
                    amount: -1 * partnerInvoice.commissionAmount, // multiply by -1 to make it a credit
                    description: `Credit for ${partnerInvoice.id}`,
                    metadata: {
                        invoiceId: partnerInvoice.id
                    },
                    currency: 'usd',
                });

                await stripe.customers.update(customerId, { balance: newCustomerBalance, });

                await PartnerService.setBalanceTransactionId(invoiceId, balanceTransaction.id);
            } else if (payoutStatusUpdate[invoiceId] === 'pendingRejection') {
                await PartnerService.updateRejectedPayoutStatus(invoiceId);
            }
        } catch (e) {
            logger.error('error updating payout status: ', e);
            return res.status(400).send(`Error updating payout status: ${e}`);
        }
    });

    return res.status(200);
});

export default handler;
