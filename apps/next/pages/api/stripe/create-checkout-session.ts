import { giftSummaryPath } from '@app/util/constants';
import type { Stripe } from 'stripe';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import stripe from '../../../util/ssr/stripe';
import { getCustomerId } from '../../../util/ssr/stripe';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { price, isSubscription, quantity = 1, cancel_path = '/pricing' } = req.body;

    console.log(req.body);

    if (!price) {
        throw new Error('Missing parameter price');
    }

    const userId: string = req.session.userId;

    const customerId: string = await getCustomerId(userId);

    const checkoutSession: Stripe.Response<Stripe.Checkout.Session> = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer: customerId,
        // used to link the created subscription back to the user when the payment is complete
        client_reference_id: userId,
        line_items: [
            {
                price: price,
                quantity,
                // only set this if it's a subscription
                adjustable_quantity: isSubscription ? undefined : {
                    enabled: true,
                    minimum: 1,
                    maximum: 100,
                }
            },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        allow_promotion_codes: true,
        subscription_data: isSubscription
            ? {
                  trial_from_plan: true,
                  metadata: {},
              }
            : {},
        success_url: isSubscription ? `${process.env.NEXTAUTH_URL}/account` : `${process.env.NEXTAUTH_URL}${giftSummaryPath}`,
        cancel_url: `${process.env.NEXTAUTH_URL}${cancel_path}`,
    });

    return res.status(200).json({ sessionId: checkoutSession.id });
});

export default handler;
