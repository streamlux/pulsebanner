import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = async () => {
    if (!stripePromise) {
        const loadStripe = (await import('@stripe/stripe-js')).loadStripe;
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

export default getStripe;
