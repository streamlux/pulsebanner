import prisma from '../../util/ssr/prisma';

// add any other payment logic to this file in the future
export type PaymentPlan = 'Professional' | 'Personal' | 'Free';

export type APIPaymentObject = {
    plan: PaymentPlan;
    partner: boolean;
    priceId?: string;
    productId?: string;
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

    return userInfo?.partner ?? false;
};

const checkPaymentPlan = async (userId: string, priceId?: string): Promise<PaymentPlan> => {
    // check what price level they are using
    if (priceId !== undefined) {
        const prices = await prisma.price.findFirst({
            where: {
                id: priceId,
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

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId: userId,
        },
        include: {
            price: {
                include: {
                    product: true
                }
            }
        }
    });

    const priceId: string | undefined = subscription?.priceId;

    const partnerAccount: boolean = await checkPartnerAccount(userId);
    const paymentPlan: PaymentPlan = await checkPaymentPlan(userId, priceId);

    return {
        partner: partnerAccount,
        plan: partnerAccount ? 'Professional' : paymentPlan,
        priceId,
        productId: subscription?.price?.productId,
    };
};
