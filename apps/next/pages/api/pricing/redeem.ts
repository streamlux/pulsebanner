import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import stripe, { getCustomerId } from '@app/util/ssr/stripe';
import { giftPromoCodeLookupMap } from '@app/util/stripe/constants';
import Stripe from 'stripe';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    // get the query param
    const queryParam = req.query.promoCode as string;

    if (queryParam === undefined) {
        return res.status(400).send('Promo code not provided in query param');
    }

    // Check if the promo code is used and go to status
    const promoCode = (await stripe.promotionCodes.retrieve(queryParam)) as Stripe.PromotionCode;
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

    return res.redirect(checkoutSession.url);
});
export default handler;
