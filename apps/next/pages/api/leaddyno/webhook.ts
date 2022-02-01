import { logger } from '@app/util/logger';
import { createApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';

const handler = createApiHandler();

handler.post(async (req, res) => {
    const body = req.body;

    const affiliateId = body.affiliate_id;
    const amount = body.amount; // amount is in cents
    const currency = body.currency;

    // if we have the affiliate ID, we need to:
    // 1. Fetch the userId associated with it
    // 2. Get their subscription status
    // 3. Credit their stripe account based on the amount
    if (affiliateId) {
        const affiliateInfo = await prisma.affiliateInformation.findFirst({
            where: {
                affiliateId: affiliateId,
            },
        });

        if (affiliateInfo === null) {
            logger.error('Affiliate was not found but made a request from leaddyno.', { affiliate: affiliateId, amount: amount * 100, currency: currency });
            return res.status(400).send(`Affiliate not found: ${affiliateId}`);
        }

        const userId = affiliateInfo.userId;

        // get the customer id
        const customer = await prisma.customer.findUnique({
            where: {
                userId: userId,
            },
        });

        if (customer !== null) {
            const customerId = customer.id;

            try {
                // list all invoices for the user
                const customerInvoices = await stripe.invoices.list({ customer: customerId });

                if (customerInvoices.data.length !== 0) {
                    // get the first invoice
                    const newestInvoiceId = customerInvoices.data[0].id;

                    // Apply the credit (amount) to this
                    await stripe.creditNotes.create({ invoice: newestInvoiceId, credit_amount: amount * 100 });
                    logger.info('Successfully applied credit amount to next invoice. ', { userId: userId, amount: amount * 100 });
                } else {
                    logger.error('Could not find any customer invoices to apply discount.', { userId: userId, amount: amount * 100 });
                    return res.status(400).send('Could not find any customer invoices to apply discount.');
                }
            } catch (err) {
                logger.error('Error applying the credit to the customer account. ', { error: err, userId: userId, amount: amount * 100, currency: currency });
                return res.status(400).send('Error applying the credit to the customer account.');
            }
        }
        return;
    }
    return res.status(200).send('Successfully applied credit amount to next invoice.');
});

export default handler;
