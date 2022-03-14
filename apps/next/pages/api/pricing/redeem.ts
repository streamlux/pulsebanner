import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import stripe, { getCustomerId } from '@app/util/ssr/stripe';
import { giftPromoCodeLookupMap } from '@app/util/stripe/constants';
import Stripe from 'stripe';

/**
 * We redirect requests to /redeem&code=<CODE> to this API endpoint. The redirect is setup in next.config.js.
 */

const handler = createAuthApiHandler();

handler.get(async (req, res) => {

    // get the query param
    const code: string = req.query.code as string;
    if (code === undefined || typeof code !== 'string') {
        logger.info('Query param is undefined or not a string. Redirecting to the home page.');
        return res.redirect('/');
    }

    const promoCode: Stripe.PromotionCode | undefined = await getPromoCodeByCode(code);
    if (!promoCode) {
        logger.error('Could not find Stripe promo code. Redirecting to home page.', { code });
        return res.redirect('/');
    }

    // Check if the gift has already been redeemed by checking if the Stripe promotion code is used and go to status
    // Stripe sets the promo code to inactive once it has met the max_redemptions setting (which for gifts is 1).
    if (promoCode.active === false) {
        // redirect the user to a page telling them that the gift has already been redeemed
        return res.redirect('/redeem/status');
    }

    const couponId: string = promoCode.coupon.id;
    const priceId: string = giftPromoCodeLookupMap[couponId];
    const userId: string = req.session.userId;
    const customerId: string = await getCustomerId(userId);

    // create a Stripe checkout session
    // the user will enter payment details and then "purchase" (for 0 cost) the subscription with the coupon applied
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


    if (checkoutSession.url) {
        logger.info('Created Stripe checkout session for gift redemption. Redirecting to checkout session url.', { sessionId: checkoutSession.id });
        return res.redirect(checkoutSession.url);
    } else {
        logger.error('No checkout session url. Throwing error and redirecting to home page');
        return res.redirect('/');
    }
});
export default handler;

/**
 * Get a Stripe promo code via the promo code (not the ID).
 *
 * @param code promo code text
 * @returns Stripe promotion code
 */
async function getPromoCodeByCode(code: string): Promise<Stripe.PromotionCode | undefined> {
    // we have to use promotionCodes.list here to search by code, rather than retrieve it by id
    const promoCodeList: Stripe.Response<Stripe.ApiList<Stripe.PromotionCode>> = await stripe.promotionCodes.list({ code: code });
    if (promoCodeList.data.length !== 1) {
        return undefined;
    }
    return promoCodeList.data[0];
}
