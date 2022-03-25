import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { validateTwitterAuthentication } from '@app/services/twitter/twitterHelpers';

const handler = createAuthApiHandler();

// do we need this method
handler.post(async (req, res) => {
    const userId = req.session?.userId;
    const streamName = req.body.streamName ?? '';

    if (!userId) {
        return res.send(404);
    }

    // validate twitter here before saving
    const userInfo = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
        },
    });

    if (userInfo && userInfo.oauth_token && userInfo.oauth_token_secret) {
        const valid = await validateTwitterAuthentication(userInfo.oauth_token, userInfo.oauth_token_secret);
        if (!valid) {
            // send 401 if not authenticated
            return res.send(401);
        }
    } else {
        return res.send(404);
    }

    if (userId) {
        // we should see if they have anything in their

        await prisma.twitterName.upsert({
            where: {
                userId: userId,
            },
            create: {
                userId: userId,
                streamName: streamName,
            },
            update: {
                userId: userId,
                streamName: streamName,
            },
        });
    }
    res.status(200).send('success');
});

handler.get(async (req, res) => {
    const userId = req.session.userId;
    if (userId) {
        const twitterName = await prisma.twitterName.findFirst({
            where: {
                userId: userId,
            },
            select: {
                enabled: true,
                streamName: true,
            },
        });

        return twitterName ? res.json(twitterName) : res.json({});
    }
    return res.json({});
});

// Delete banner
handler.delete(async (req, res) => {
    await prisma.twitterName.delete({
        where: {
            userId: req.session.userId,
        },
    });

    res.send(200);
});

handler.put(async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.send(404);
    }

    // validate twitter here before saving
    const userInfo = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
        },
    });

    if (userInfo && userInfo.oauth_token && userInfo.oauth_token_secret) {
        const valid = await validateTwitterAuthentication(userInfo.oauth_token, userInfo.oauth_token_secret);
        if (!valid) {
            // send 401 if not authenticated
            return res.send(401);
        }
    } else {
        return res.send(404);
    }

    const twitterName = await prisma.twitterName.findFirst({
        where: {
            userId,
        },
    });

    if (twitterName) {
        await prisma.twitterName.update({
            where: {
                userId,
            },
            data: {
                enabled: !twitterName.enabled,
            },
        });

        // Update twitch subscriptions since we might
        // need to delete subscriptions if they disabled the banner
        // or create subscriptions if they enabled the banner
        await updateTwitchSubscriptions(userId);

        res.send(200);
    } else {
        res.send(404);
    }
});

export default handler;
