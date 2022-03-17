import Stripe from 'stripe';
import env from './env';
import prisma from './ssr/prisma';
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});

export async function seed() {
    const products = await stripe.products.list({
        limit: 100,
    });
    const prices = await stripe.prices.list({
        limit: 100,
    });

    await Promise.all(
        products.data.map((each) =>
            prisma.product.upsert({
                where: {
                    id: each.id,
                },
                create: {
                    id: each.id,
                    name: each.name,
                    description: each.description,
                    active: each.active,
                    image: each.images?.[0],
                    metadata: each.metadata,
                },
                update: {
                    name: each.name,
                    description: each.description,
                    active: each.active,
                    image: each.images?.[0],
                    metadata: each.metadata,
                },
            })
        )
    );

    await Promise.all(
        prices.data.map((each) =>
            prisma.price.upsert({
                where: {
                    id: each.id,
                },
                create: {
                    id: each.id,
                    currency: each.currency,
                    active: each.active,
                    type: each.type,
                    unitAmount: each.unit_amount,
                    interval: each.recurring?.interval,
                    interval_count: each.recurring?.interval_count,
                    trial_period_days: each.recurring?.trial_period_days,
                    product: {
                        connect: {
                            id: each.product as string,
                        },
                    },
                    metadata: each.metadata,
                    nickname: each.nickname,
                },
                update: {
                    currency: each.currency,
                    active: each.active,
                    type: each.type,
                    unitAmount: each.unit_amount,
                    interval: each.recurring?.interval,
                    interval_count: each.recurring?.interval_count,
                    trial_period_days: each.recurring?.trial_period_days,
                    metadata: each.metadata,
                    nickname: each.nickname,
                },
            })
        )
    );
}

