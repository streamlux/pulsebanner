import { sendCouponCodeToCustomerEmail } from '@app/util/stripe/emailHelper';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    console.log('here');
    // test
    sendCouponCodeToCustomerEmail('test1', 'test2');
    res.send('here');
});
export default handler;
