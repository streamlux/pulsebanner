import { sendMessage } from '@app/util/discord/sendMessage';
import { logger } from '@app/util/logger';
import prisma from '@app/util/ssr/prisma';
import stripe from '@app/util/ssr/stripe';
import Stripe from 'stripe';
import { updateOrCreateSubscription } from './helpers';

export const handleStripeCheckoutSessionCompletedForSubscription = async (data: Stripe.Checkout.Session) => {
    const subscription = await stripe.subscriptions.retrieve(data.subscription as string, {
        expand: ['default_payment_method'],
    });

    // get the subscription info
    const subscriptionInfo = await updateOrCreateSubscription(data, subscription);

    const userId = subscriptionInfo === null ? null : subscriptionInfo.userId;

    // send webhook to discord saying someone subscribed
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
};
