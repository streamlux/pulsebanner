import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';

const handler = createAuthApiHandler();

// Create or update existing profile picture with url and templateId
handler.post(async (req, res) => {
    await prisma.profilePic.upsert({
        where: {
            userId: req.session.userId,
        },
        create: {
            userId: req.session.userId,
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            foregroundProps: req.body.foregroundProps,
            backgroundProps: req.body.backgroundProps,
        },
        update: {
            backgroundId: req.body.backgroundId,
            foregroundId: req.body.foregroundId,
            foregroundProps: req.body.foregroundProps,
            backgroundProps: req.body.backgroundProps,
        },
    });

    res.send(201);
});

// Get profile pic
handler.get(async (req, res) => {
    const profilePic = await prisma.profilePic.findFirst({
        where: {
            userId: req.session.userId,
        },
        select: {
            enabled: true,
            backgroundId: true,
            foregroundId: true,
            backgroundProps: true,
            foregroundProps: true,
        },
    });

    res.json(profilePic);
});

// Delete profile pic
handler.delete(async (req, res) => {
    await prisma.profilePic.delete({
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

    // get the users profile pic
    const profilePic = await prisma.profilePic.findFirst({
        where: {
            userId,
        },
    });

    if (profilePic) {
        await prisma.profilePic.update({
            where: {
                userId,
            },
            data: {
                enabled: !profilePic.enabled,
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
