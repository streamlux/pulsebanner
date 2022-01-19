/* eslint-disable no-case-declarations */
import { PriceType, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { timestampToDate } from '../../../util/common';
import { createApiHandler } from '../../../util/ssr/createApiHandler';
import stripe from '../../../util/ssr/stripe';
import prisma from '../../../util/ssr/prisma';
import { sendMessage } from '@app/util/discord/sendMessage';
import { FeaturesService } from '@app/services/FeaturesService';
import { download } from '@app/util/s3/download';
import { env } from 'process';
import { TwitterResponseCode, updateProfilePic } from '@app/util/twitter/twitterHelpers';
import { flipFeatureEnabled, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { defaultBannerSettings } from '@app/pages/banner';

// Stripe requires the raw body to construct the event.
export const config = {
    api: {
        bodyParser: false,
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buffer(readable: any) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

const relevantEvents = new Set([
    'product.created',
    'product.updated',
    'price.created',
    'price.updated',
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
]);

const handler = createApiHandler();

handler.post(async (req, res) => {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`❌ Error verifying webhook. Message: ${err?.message}`);
        console.log('secret', process.env.STRIPE_WEBHOOK_SECRET);
        return res.status(400).send(`Webhook Error: ${err?.message}`);
    }

    if (relevantEvents.has(event.type)) {
        try {
            switch (event.type) {
                case 'product.created':
                case 'product.updated':
                    const data = event.data.object as Stripe.Product;
                    await prisma.product.upsert({
                        where: {
                            id: data.id,
                        },
                        update: {
                            name: data.name,
                            description: data.description,
                            active: data.active,
                            metadata: data.metadata,
                        },
                        create: {
                            id: data.id,
                            name: data.name,
                            description: data.description,
                            active: data.active,
                            metadata: data.metadata,
                        },
                    });
                    break;
                case 'price.created':
                case 'price.updated': {
                    const data = event.data.object as Stripe.Price;
                    await prisma.price.upsert({
                        where: {
                            id: data.id,
                        },
                        update: {
                            active: data.active,
                            currency: data.currency,
                            type: data.type as PriceType,
                            unitAmount: data.unit_amount,
                            interval: data.recurring?.interval,
                            interval_count: data.recurring?.interval_count,
                            trial_period_days: data.recurring?.trial_period_days,
                        },
                        create: {
                            id: data.id,
                            active: data.active,
                            currency: data.currency,
                            type: data.type as PriceType,
                            unitAmount: data.unit_amount,
                            interval: data.recurring?.interval,
                            interval_count: data.recurring?.interval_count,
                            trial_period_days: data.recurring?.trial_period_days,
                            product: {
                                connect: {
                                    id: data.product as string,
                                },
                            },
                        },
                    });
                    break;
                }
                case 'customer.subscription.deleted': {
                    const data = event.data.object as Stripe.Subscription;

                    const subscriptionInfo = await prisma.subscription.findFirst({
                        where: {
                            id: data.id,
                        },
                    });

                    const userId = subscriptionInfo === null ? null : subscriptionInfo.userId;

                    await prisma.subscription.delete({
                        where: {
                            id: data.id,
                        },
                    });

                    /**
                     * We need to handle when the user delete's their subscription. Steps to cleanup
                     *
                     * 1. Turn off pfp feature. We should probably do this gracefully by resetting it to their original image in the db.
                     * 2. Reset their banner to be the default props. If they are live, it does not matter. Update what they have in the db directly.
                     * 3. Reset name feature to be the default value. Again, handle if they are live gracefully by updating it right then to the default.
                     */
                    if (userId) {
                        sendMessage(`"${userId}" unsubscribed from premium plan`, process.env.DISCORD_CANCELLED_SUBSCRIBER_URL);

                        // get the user's twitter info
                        const twitterInfo = await getTwitterInfo(userId);

                        if (twitterInfo) {
                            const enabledFeatures = await FeaturesService.listEnabled(userId);

                            // disable the profile picture if it is enabled
                            if (enabledFeatures.includes('profileImage')) {
                                const base64Image: string | undefined = await download(env.PROFILE_PIC_BUCKET_NAME, userId);
                                if (base64Image) {
                                    const profilePicStatus: TwitterResponseCode = await updateProfilePic(
                                        userId,
                                        twitterInfo.oauth_token,
                                        twitterInfo.oauth_token_secret,
                                        base64Image
                                    );
                                    if (profilePicStatus === 200) {
                                        console.log('Successfully reset profile picture on subscription deleted.');
                                    } else {
                                        console.log('Error resetting profile picture on subscription deleted.');
                                    }
                                } else {
                                    console.log('could not find a base64 original profile picture image.');
                                }
                                await flipFeatureEnabled(userId, 'profileImage');
                                console.log('Profile image disabled on subscription cancelled.');
                            }

                            // update the banner to default properties. It is too difficualt to tell what is default and what isn't individually.
                            // if this returns null, the user never setup a banner. That is fine
                            const bannerUpdate = await prisma.banner.update({
                                where: {
                                    userId: userId,
                                },
                                data: {
                                    userId: userId,
                                    backgroundId: defaultBannerSettings.backgroundId,
                                    foregroundId: defaultBannerSettings.foregroundId,
                                    foregroundProps: defaultBannerSettings.foregroundProps,
                                    backgroundProps: defaultBannerSettings.backgroundProps,
                                },
                            });

                            if (bannerUpdate) {
                                console.log('Banner reset back to default values on subscription cancelled.');
                            } else {
                                console.log('No banner found on user subscription cancelled.');
                            }

                            // reset name feature to default value. Get their original name and then append to the front of that
                            const twitterOriginalName = await prisma.twitterOriginalName.findFirst({
                                where: {
                                    userId: userId,
                                },
                            });

                            if (twitterOriginalName && twitterOriginalName.originalName) {
                                const newLiveName = `🔴 Live now | ${twitterOriginalName.originalName}`.substring(0, 50);
                                await prisma.twitterName.update({
                                    where: {
                                        userId: userId,
                                    },
                                    data: {
                                        streamName: newLiveName,
                                    },
                                });
                            }

                            console.log('Successfully reset name if needed. All features handled on subscription cancelled.');
                        }
                    }

                    break;
                }
                case 'customer.subscription.updated': {
                    const data = event.data.object as Stripe.Subscription;

                    await prisma.subscription.update({
                        where: {
                            id: data.id,
                        },
                        data: {
                            price: {
                                connect: {
                                    id: data.items.data[0].price.id,
                                },
                            },
                            status: data.status,
                            metadata: data.metadata,
                            cancel_at_period_end: data.cancel_at_period_end,
                            canceled_at: timestampToDate(data.canceled_at),
                            cancel_at: timestampToDate(data.cancel_at),
                            start_date: timestampToDate(data.start_date),
                            ended_at: timestampToDate(data.ended_at),
                            trial_start: timestampToDate(data.trial_start),
                            trial_end: timestampToDate(data.trial_end),
                        },
                    });
                    break;
                }
                case 'checkout.session.completed':
                    {
                        const data = event.data.object as Stripe.Checkout.Session;

                        const subscription = await stripe.subscriptions.retrieve(data.subscription as string, {
                            expand: ['default_payment_method'],
                        });

                        await prisma.subscription.upsert({
                            where: {
                                id: subscription.id,
                            },
                            create: {
                                id: subscription.id,
                                user: {
                                    connect: {
                                        id: data.client_reference_id,
                                    },
                                },
                                price: {
                                    connect: {
                                        id: subscription.items.data[0].price.id,
                                    },
                                },
                                status: subscription.status as SubscriptionStatus,
                                metadata: subscription.metadata,
                                cancel_at_period_end: subscription.cancel_at_period_end,
                                canceled_at: timestampToDate(subscription.canceled_at),
                                cancel_at: timestampToDate(subscription.cancel_at),
                                start_date: timestampToDate(subscription.start_date),
                                ended_at: timestampToDate(subscription.ended_at),
                                trial_start: timestampToDate(subscription.trial_start),
                                trial_end: timestampToDate(subscription.trial_end),
                            },
                            update: {
                                status: subscription.status as SubscriptionStatus,
                                metadata: subscription.metadata,
                                price: {
                                    connect: {
                                        id: subscription.items.data[0].price.id,
                                    },
                                },
                                cancel_at_period_end: subscription.cancel_at_period_end,
                                canceled_at: timestampToDate(subscription.canceled_at),
                                cancel_at: timestampToDate(subscription.cancel_at),
                                start_date: timestampToDate(subscription.start_date),
                                ended_at: timestampToDate(subscription.ended_at),
                                trial_start: timestampToDate(subscription.trial_start),
                                trial_end: timestampToDate(subscription.trial_end),
                            },
                        });

                        const subscriptionInfo = await prisma.subscription.findUnique({
                            where: {
                                id: subscription.id,
                            },
                        });
                        const userId = subscriptionInfo === null ? null : subscriptionInfo.userId;
                        // send webhook to discord saying someone subscribed
                        if (userId) {
                            prisma.subscription.count().then((value) => {
                                sendMessage(`"${userId}" signed up for a premium plan! Total premium users: ${value}`, process.env.DISCORD_NEW_SUBSCRIBER_URL);
                            });
                        }
                    }

                    break;
                default:
                    throw new Error(`Unhandled relevant event! ${event.type}`);
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send('Webhook error: "Webhook handler failed. View logs."');
        }
    }

    res.json({ received: true });
});

export default handler;
