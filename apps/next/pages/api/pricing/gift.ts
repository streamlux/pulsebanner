import { createApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { sendGiftPurchaseEmail } from '@app/util/stripe/emailHelper';

/**
 * We redirect requests to /redeem&giftId=<ID> to this API endpoint. The redirect is setup in next.config.js.
 */

const handler = createApiHandler();

handler.get(async (req, res) => {

    const customerEmail = 'alex.weininger@live.com';

    const gifts = await prisma.giftPurchase.findMany({ where: { checkoutSessionId: 'cs_test_b1AeqhO1DfwmnmouVrgOHnDHxLW3PDapxjxPTOQC88iqwzSs09tpWbAqZt' } });

    const html = await sendGiftPurchaseEmail(customerEmail, gifts);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
});
export default handler;
