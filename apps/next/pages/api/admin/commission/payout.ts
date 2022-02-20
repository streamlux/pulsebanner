import { getPartnerCustomerInfo, getPartnerInfo, getPartnerInvoice, updateRejectedPayoutStatus, updateSuccessfulPayoutStatus } from '@app/util/partner/payoutHelpers';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import stripe from '@app/util/ssr/stripe';
import { CommissionStatus } from '@prisma/client';

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
                // get the invoiceId
                const partnerInvoice = await getPartnerInvoice(invoiceId);

                if (partnerInvoice === undefined) {
                    console.log('No partner or commission amount associated with invoice: ', invoiceId);
                    return res.status(400).send(`No partner or commission amount associated with invoice: ${invoiceId}`);
                }

                const partnerUserId = await getPartnerInfo(partnerInvoice.partnerId);

                if (partnerUserId === undefined) {
                    console.log('Could not find the partner info.');
                    return res.status(400).send(`No partner info found for partnerId: ${partnerInvoice.partnerId}`);
                }

                const userId = partnerUserId;

                const customerId = await getPartnerCustomerInfo(userId);

                if (customerId === null) {
                    console.log('Could not find the partners stripe customer info.');
                    return res.status(400).send(`Could not find the partners stripe customer info. UserId: ${userId}`);
                }

                // call stripe api to get the list of invoices for the customer. Get the most recent one
                const invoiceItem = await stripe.invoiceItems.list({ customer: customerId, limit: 1 });
                const partnerInvoiceId = invoiceItem.data[0].id;

                // This is the invoiceId that was the discount
                await stripe.creditNotes.create({ invoice: partnerInvoiceId, credit_amount: partnerInvoice.commissionAmount });

                await updateSuccessfulPayoutStatus(invoiceId);
            } else if (payoutStatusUpdate[invoiceId] === 'pendingRejection') {
                await updateRejectedPayoutStatus(invoiceId);
            }
        } catch (e) {
            console.log('error updating payout status: ', e);
            return res.status(400).send(`Error updating payout status: ${e}`);
        }
    });

    return res.status(200);
});

export default handler;
