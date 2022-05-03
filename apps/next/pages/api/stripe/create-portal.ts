import prisma from '@app/util/ssr/prisma';
import { Subscription } from '@prisma/client';
import Stripe from 'stripe';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import stripe from '../../../util/ssr/stripe';
import { getCustomerId } from '../../../util/ssr/stripe';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    const userId: string = req.session.userId;

    const allowCancel = req.body.allow_cancel;

    const customerId: string = await getCustomerId(userId);

    const billingConfiguration = await createBillingPortalConfiguration({
        allowCancel
    });

    const subscription: Subscription | null = await prisma.subscription.findUnique({
        where: {
            userId: userId
        },
        rejectOnNotFound: false,
    });

    const { url } = await stripe.billingPortal.sessions.create({
        customer: customerId,
        configuration: billingConfiguration.id,
        return_url: `${process.env.NEXTAUTH_URL}${req.body.return_url ?? '/account'}`
    });

    const body: any = { url };
    if (subscription) {
        body.subscriptionUrl = `${url}/subscriptions/${subscription.id}/update`;
    }

    return res.status(200).json(body);
});


async function createBillingPortalConfiguration(options: {
    allowCancel?: boolean,
}): Promise<Stripe.BillingPortal.Configuration> {

    return await stripe.billingPortal.configurations.create({
        business_profile: {
            headline: 'PulseBanner',
            privacy_policy_url: `${process.env.NEXTAUTH_URL}/privacy`,
            terms_of_service_url: `${process.env.NEXTAUTH_URL}/terms`,
        },
        features: {
            payment_method_update: { enabled: true },
            subscription_cancel: {
                enabled: !!options.allowCancel,
                cancellation_reason: {
                    enabled: true,
                    options: [
                        'missing_features',
                        'too_expensive',
                        'too_complex',
                        'other',
                    ]
                }
            },
            invoice_history: {
                enabled: true,
            },
            subscription_update: {
                default_allowed_updates: ['price'],
                enabled: true,
                products: await getProducts()
            },
        }
    });
}

async function getProducts(): Promise<Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.Product[]> {
    const products = await prisma.product.findMany({
        where: {
            AND: [
                { active: true }
            ],
            prices: {
                some: {
                    type: 'recurring',
                }
            }
        },
        include: {
            prices: {
                where: {
                    AND: [
                        { active: true },
                        { type: 'recurring' }
                    ],
                }
            }
        }
    });

    return products.map(product => {
        return {
            product: product.id,
            prices: product.prices.map(price => price.id)
        }
    });
}

export default handler;
