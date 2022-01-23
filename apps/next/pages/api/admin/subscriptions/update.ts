import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    if (req.query.userId && typeof req.query.userId === 'string') {
        await updateTwitchSubscriptions(req.query.userId);
        return 200;
    } else {
        return res.status(400).end('Missing userId parameter');
    }
});

export default handler;
