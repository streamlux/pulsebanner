import { Context } from '@app/services/Context';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    if (!req.query.userId || !(typeof req.query.userId === 'string')) {
        return res.status(400).end();
    }

    const context = new Context(req.query.userId, {
        action: 'Update Twitch Subscriptions (admin)',
        admin: true
    });

    if (req.query.userId && typeof req.query.userId === 'string') {
        await updateTwitchSubscriptions(context);
        return 200;
    } else {
        return res.status(400).end('Missing userId parameter');
    }
});

export default handler;
