import { APIPaymentObject, productPlan } from '@app/services/payment/paymentHelpers';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    const userId = req.session.userId;

    const plan: APIPaymentObject = await productPlan(userId);

    return res.status(200).json(plan);
});

export default handler;
