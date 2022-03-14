import { sendMessage } from '@app/util/discord/sendMessage';
import { logger } from '@app/util/logger';
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';
import { Subscription } from '@prisma/client';
import Stripe from 'stripe';
import { upsertSubscriptionFromCheckoutSession } from './upsertSubscription';

/**
 * Handles the Stripe checkout.session.completed event when mode is subscription.
 *
 * @param checkoutSession Stripe checkout session data from webhook
 */
export async function handleSubscriptionCheckoutSessionComplete(checkoutSession: Stripe.Checkout.Session): Promise<void> {
    const subscription: Stripe.Response<Stripe.Subscription> = await stripe.subscriptions.retrieve(checkoutSession.subscription as string, {
        expand: ['default_payment_method'],
    });

    // get the subscription info
    const subscriptionInfo: Subscription = await upsertSubscriptionFromCheckoutSession(subscription, checkoutSession.client_reference_id);

    const userId = subscriptionInfo === null ? null : subscriptionInfo.userId;
    sendDiscordNotification(userId, subscriptionInfo);
};

// send webhook to discord saying someone subscribed
function sendDiscordNotification(userId: string, subscriptionInfo: Subscription) {
    if (userId) {
        const notify = async () => {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            const priceId = subscriptionInfo.priceId;
            const priceInfo = await prisma.price.findUnique({
                where: {
                    id: priceId,
                },
            });
            if (priceInfo !== null) {
                const intervalId = priceInfo.interval;
                const productId = priceInfo.productId;

                const productInfo = await prisma.product.findUnique({
                    where: {
                        id: productId,
                    },
                    select: {
                        name: true,
                    },
                });

                if (productInfo !== null) {
                    const msg = `${user.name} upgraded to a ${intervalId}ly ${productInfo.name} subscription.`;
                    logger.info(msg, { userId: userId });
                    const count = await prisma.subscription.count({
                        where: {
                            status: {
                                in: ['active', 'past_due'],
                            },
                        },
                    });

                    sendMessage(`${msg} Total premium users: ${count}`, process.env.DISCORD_NEW_SUBSCRIBER_URL);
                }
            } else {
                logger.info(`User successfully signed up for a membership. User: ${userId}`, { userId: userId });
                prisma.subscription.count().then((value) => {
                    sendMessage(`"${userId}" signed up for a premium plan! Total premium users: ${value}`, process.env.DISCORD_NEW_SUBSCRIBER_URL);
                });
            }
        };
        void notify();
    }
}
