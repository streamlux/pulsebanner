import prisma from '../ssr/prisma';

// add any other payment logic to this file in the future
export type PaymentPlan = 'Professional' | 'Personal' | 'Free';

export type APIPaymentObject = {
    plan: PaymentPlan;
    partner: boolean;
};

const checkPartnerAccount = async (userId: string): Promise<boolean> => {
    const userInfo = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            partner: true,
        },
    });

    return userInfo.partner ?? false;
};

const checkPaymentPlan = async (userId: string): Promise<PaymentPlan> => {
    const paymentPlan = await prisma.subscription.findFirst({
        where: {
            userId: userId,
        },
        select: {
            priceId: true,
        },
    });

    // check what price level they are using
    if (paymentPlan !== null) {
        const prices = await prisma.price.findFirst({
            where: {
                id: paymentPlan.priceId,
            },
            select: {
                productId: true,
            },
        });

        // check what product they are using
        if (prices !== null) {
            const product = await prisma.product.findFirst({
                where: {
                    id: prices.productId,
                },
                select: {
                    name: true,
                },
            });

            if (product !== null) {
                return product.name as PaymentPlan;
            }
        }
    }

    return 'Free';
};

export const productPlan = async (userId: string): Promise<APIPaymentObject> => {
    const partnerAccount = await checkPartnerAccount(userId);
    const paymentPlan = await checkPaymentPlan(userId);

    return {
        partner: partnerAccount,
        plan: partnerAccount ? 'Professional' : paymentPlan,
    };
};
