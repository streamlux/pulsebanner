import prisma from '@app/util/ssr/prisma';
import { Subscription } from '@prisma/client';
import Stripe from 'stripe';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import stripe from '../../../util/ssr/stripe';
import { getCustomerId } from '../../../util/ssr/stripe';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    const userId: string = req.session.userId;

    const customerId: string = await getCustomerId(userId);

    const billingConfiguration = await createBillingPortalConfiguration();

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

async function createBillingPortalConfiguration(): Promise<Stripe.BillingPortal.Configuration> {
    return await stripe.billingPortal.configurations.create({
        business_profile: {
            headline: 'PulseBanner',
            privacy_policy_url: `${process.env.NEXTAUTH_URL}/privacy`,
            terms_of_service_url: `${process.env.NEXTAUTH_URL}/terms`,
        },
        features: {
            payment_method_update: { enabled: true },
            invoice_history: {
                enabled: true,
            },
            subscription_update: {
                default_allowed_updates: ['price'],
                enabled: true,
                products: [
                    {
                        // monthly and yearly personal
                        product: 'prod_J1kovG9t6kOvJ1',
                        prices: ['price_1JwkpXJzF2VT0EeKXFGDsr5A', 'price_1JwgTKJzF2VT0EeKxAbRNX6d']
                    },
                    {
                        // monthly and yearly professional
                        product: 'prod_J1kpUjbr9VENK1',
                        prices: ['price_1JwgPBJzF2VT0EeK31OQd0UG', 'price_1JwgShJzF2VT0EeKsIvKjFDc']
                    }
                ]
            },
        }
    });
}

export default handler;
