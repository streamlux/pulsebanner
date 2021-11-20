import prisma from '@app/util/ssr/prisma';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';

const handler = createAuthApiHandler();

// Create or update existing banner with url and templateId
handler.post(async (req, res) => {
    await prisma.banner.upsert({
        where: {
            userId: req.session.userId,
        },
        create: {
            userId: req.session.userId,
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            backgroundProps: req.body.backgroundProps,
            foregroundProps: req.body.foregroundProps
        },
        update: {
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            backgroundProps: req.body.backgroundProps,
            foregroundProps: req.body.foregroundProps
        },
    });

    res.send(201);
});

// Get banner
handler.get(async (req, res) => {
    const userId = req.session.userId;
    try {
        const banner = await prisma.banner.findUnique({
            where: {
                userId
            },
            select: {
                enabled: true,
                backgroundId: true,
                backgroundProps: true,
                foregroundId: true,
                foregroundProps: true
            },
            rejectOnNotFound: true
        });
        res.status(200).json(banner);
    } catch (e) {

        const banner = await prisma.banner.create({
            data: {
                backgroundId: 'CSSBackground',
                foregroundId: 'ImLive',
                backgroundProps: {},
                foregroundProps: {},
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

        res.status(201).json(banner);
    }
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

    // get the users banner
    const banner = await prisma.banner.findFirst({
        where: {
            userId,
        }
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
