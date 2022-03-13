import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import stripe, { getCustomerId } from '@app/util/ssr/stripe';
import { giftPromoCodeLookupMap } from '@app/util/stripe/constants';
import Stripe from 'stripe';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    logger.info('Inside the redeem endpoint');
    // get the query param
    const queryParam = req.query.promoCode as string;
    logger.info('Query param: ', queryParam);
    if (queryParam === undefined) {
        logger.info('Query param is undefined. Redirecting to the home page.');
        return res.redirect('/');
    }

    // Check if the promo code is used and go to status
    const promoCode = await stripe.promotionCodes.retrieve(queryParam);
    logger.info('promoCode: ', { code: promoCode });
    if (promoCode.active === false) {
        return res.redirect('/redeem/status');
    }

    const couponId = promoCode.coupon.id;

    const priceId = giftPromoCodeLookupMap[couponId];

    const userId: string = req.session.userId;

    const customerId: string = await getCustomerId(userId);

    const checkoutSession: Stripe.Response<Stripe.Checkout.Session> = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer: customerId,
        client_reference_id: userId,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        subscription_data: {
            trial_from_plan: true,
            metadata: {},
        },
        success_url: `${process.env.NEXTAUTH_URL}/account`,
        cancel_url: `${process.env.NEXTAUTH_URL}/`,
        discounts: [
            {
                promotion_code: promoCode.id,
            },
        ],
    });

    logger.info('Got to bottom of the endpoint. Going to the redirect');

    return res.redirect(checkoutSession.url);
});
export default handler;
