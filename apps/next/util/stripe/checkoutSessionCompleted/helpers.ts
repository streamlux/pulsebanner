import { timestampToDate } from "@app/util/common";
import prisma from "@app/util/ssr/prisma";
import { Subscription, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export const updateOrCreateSubscription = async (data: Stripe.Checkout.Session, subscription: Stripe.Response<Stripe.Subscription>): Promise<Subscription> => {
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

    return subscriptionInfo;
}
