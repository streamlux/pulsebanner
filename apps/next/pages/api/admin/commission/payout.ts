import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { CommissionStatus } from '@prisma/client';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(401).send('Not admin user');
    }

    const payoutStatusUpdate = req.body.payoutStatusMap as Record<string, CommissionStatus>;
    if (!payoutStatusUpdate) {
        return res.status(400).send('Payouts to update not provided in body.');
    }

    // Only do operation with stripe when it goes to completed state
    return res.status(200);
});

export default handler;
