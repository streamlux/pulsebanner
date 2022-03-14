import { logger } from '@app/util/logger';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import stripe, { getCustomerId } from '@app/util/ssr/stripe';
import { giftPromoCodeLookupMap, giftRedemptionLinkQueryParamName } from '@app/util/stripe/constants';
import { GiftPurchase } from '@prisma/client';
import Stripe from 'stripe';

/**
 * We redirect requests to /redeem&giftId=<ID> to this API endpoint. The redirect is setup in next.config.js.
 */

const handler = createAuthApiHandler();

handler.get(async (req, res) => {

    // get the query param
    const giftPurchaseId: string = req.query[giftRedemptionLinkQueryParamName] as string;
    if (giftPurchaseId === undefined || typeof giftPurchaseId !== 'string') {
        logger.info('Query param giftId is undefined or not a string. Redirecting to the home page.');
        return res.redirect('/');
    }

    // lookup the gift purchase by the ID supplied in the query param
    const giftPurchase: GiftPurchase | null = await prisma.giftPurchase.findUnique({
        where: {
            id: giftPurchaseId,
        }
    });

    if (!giftPurchase) {
        logger.error('Could not find Gift purchase. Redirecting to home page.', { id: giftPurchaseId });
        return res.redirect('/');
    }

    // use Stripe API to get the promo code using the promotion code ID from the gift purchase
    const promoCode: Stripe.PromotionCode | undefined = await getPromoCodeById(giftPurchase.promoCodeId);
    if (!promoCode) {
        logger.error('Could not find Stripe promo code. Redirecting to home page.', { id: giftPurchaseId, promoCodeId: giftPurchase.promoCodeId });
        return res.redirect('/');
    }

    // Check if the gift has already been redeemed
    if (isPromoCodeRedeemed(promoCode)) {
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
 * Get a Stripe promo code via ID.
 *
 * @param id promo code ID
 * @returns Stripe promotion code
 */
async function getPromoCodeById(id: string): Promise<Stripe.PromotionCode | undefined> {
    try {
        const promoCode: Stripe.Response<Stripe.PromotionCode> = await stripe.promotionCodes.retrieve(id);
        return promoCode;
    } catch (e) {
        logger.error('Error getting Stripe promo code.', { error: e, id });
        return undefined;
    }
}

function isPromoCodeRedeemed(promoCode: Stripe.PromotionCode): boolean {
    // Stripe sets the promo code to inactive once it has met the max_redemptions setting (which for gifts is 1).
    return promoCode.active === false;
}
