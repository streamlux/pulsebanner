import prisma from '@app/util/ssr/prisma';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { validateTwitterAuthentication } from '@app/util/twitter/twitterHelpers';

const handler = createAuthApiHandler();

// Create or update existing banner with url and templateId
handler.post(async (req, res) => {
    const userId = req.session?.userId;
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

    await prisma.banner.upsert({
        where: {
            userId: req.session.userId,
        },
        create: {
            userId: req.session.userId,
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            backgroundProps: req.body.backgroundProps,
            foregroundProps: req.body.foregroundProps,
        },
        update: {
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            backgroundProps: req.body.backgroundProps,
            foregroundProps: req.body.foregroundProps,
        },
    });

    res.send(201);
});

// Get banner
handler.get(async (req, res) => {
    const banner = await prisma.banner.findFirst({
        where: {
            userId: req.session.userId,
        },
        select: {
            enabled: true,
            backgroundId: true,
            backgroundProps: true,
            foregroundId: true,
            foregroundProps: true,
        },
    });

    res.json(banner);
});

// Delete banner
handler.delete(async (req, res) => {
    await prisma.banner.delete({
        where: {
            userId: req.session.userId,
        },
    });

    res.send(200);
});

// Toggle enabled/disabled
// then update twitch subscriptions
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

    // get the users banner
    const banner = await prisma.banner.findFirst({
        where: {
            userId,
        },
    });

    if (banner) {
        await prisma.banner.update({
            where: {
                userId,
            },
            data: {
                enabled: !banner.enabled,
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
