import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
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
    try {
        Object.keys(payoutStatusUpdate).forEach(async (invoiceId: string) => {
            // if the status is in completed, add a discount to their account
            if (payoutStatusUpdate[invoiceId] === 'pendingCompletion') {
                // get the invoiceId
                const partnerInvoice = await prisma.partnerInvoice.findUnique({
                    where: {
                        id: invoiceId,
                    },
                    select: {
                        partnerId: true,
                        commissionAmount: true,
                    },
                });

                if (!partnerInvoice || !partnerInvoice.partnerId || !partnerInvoice.commissionAmount) {
                    console.log('There is no partner associated with this invoice.');
                    return res.status(400).send(`No partner associated with invoice: ${invoiceId}`);
                }
                // now we have the partner that was used for the discount, apply the credit note to their last invoice

                // get their userId
                const partnerInfo = await prisma.partnerInformation.findUnique({
                    where: {
                        partnerId: partnerInvoice.partnerId,
                    },
                    select: {
                        userId: true,
                    },
                });

                if (partnerInfo === null) {
                    console.log('Could not find the partner info.');
                    return res.status(400).send(`No partner info found for partnerId: ${partnerInvoice}`);
                }

                const userId = partnerInfo.userId;

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
                    console.log('Could not find the partners stripe customer info.');
                    return res.status(400).send(`Could not find the partners stripe customer info. UserId: ${userId}`);
                }

                // call stripe api to get the list of invoices for the customer. Get the most recent one
                const invoiceItem = await stripe.invoiceItems.list({ customer: customerId.id, limit: 1 });
                const partnerInvoiceId = invoiceItem.data[0].id;

                // This is the invoiceId that was the discount
                await stripe.creditNotes.create({ invoice: partnerInvoiceId, credit_amount: partnerInvoice.commissionAmount });

                // update the commission status
                await prisma.partnerInvoice.update({
                    where: {
                        id: invoiceId,
                    },
                    data: {
                        commissionStatus: 'complete',
                    },
                });
            }
        });
    } catch (e) {
        console.log('error updating payout status: ', e);
        return res.status(400).send(`Error updating payout status: ${e}`);
    }

    return res.status(200);
});

export default handler;
