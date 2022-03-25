import { CustomSession } from '@app/services/auth/CustomSession';
import { giftRedemptionLinkQueryParamName, giftPromoCodeLookupMap } from '@app/services/stripe/gift/constants';
import { getPromoCodeById, isPromoCodeRedeemed } from '@app/services/stripe/gift/redeemHelpers';
import { logger } from '@app/util/logger';
import { createApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import stripe, { getCustomerId } from '@app/util/ssr/stripe';
import { GiftPurchase } from '@prisma/client';
import { getSession } from 'next-auth/react';
import Stripe from 'stripe';

const alreadyRedeemedUrl = '/gifts/redeem/fail';
const purchaseSuccessUrl = '/gifts/redeem/success';

/**
 * We redirect requests to /redeem&giftId=<ID> to this API endpoint. The redirect is setup in next.config.js.
 */

const handler = createApiHandler();

handler.get(async (req, res) => {

    // get the query param
    const giftPurchaseId: string = req.query[giftRedemptionLinkQueryParamName] as string;

    const session: CustomSession | null = await getSession({req}) as CustomSession | null;
    if (!session) {
        return res.redirect(`/gifts/redeem/signin?redirect=/redeem?${giftRedemptionLinkQueryParamName}=` + giftPurchaseId);
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId: session.userId,
        }
    });

    // if the user already has a subscription, don't let them redeem a gift
    if (subscription) {
        logger.info('User already has a subscription. Redirecting to the home page.');
        return res.redirect('/');
    }

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
        return res.redirect(alreadyRedeemedUrl);
    }

    const couponId: string = promoCode.coupon.id;
    const priceId: string = giftPromoCodeLookupMap[couponId];
    const userId: string = session.userId;
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
        success_url: `${process.env.NEXTAUTH_URL}${purchaseSuccessUrl}`,
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
