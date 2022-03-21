import { timestampToDate } from "@app/util/common";
import prisma from "@app/util/ssr/prisma";
import { Subscription, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

/**
 * Create or update a subscription in the database from a checkout session.
 *
 * @param subscription Stripe subscription object
 * @param userId User ID of the user who purchased the subscription. We use the `client_reference_id` on the checkout session to find the user.
 * We set the `client_reference_id` to the user ID when we create the checkout session in create-checkout-session.ts.
 * @returns created or updated subscription
 */
export async function upsertSubscriptionFromCheckoutSession(subscription: Stripe.Response<Stripe.Subscription>, userId: string): Promise<Subscription> {
    const resultingSubscription = await prisma.subscription.upsert({
        where: {
            id: subscription.id,
        },
        create: {
            id: subscription.id,
            user: {
                connect: {
                    id: userId,
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

    return resultingSubscription;
}
