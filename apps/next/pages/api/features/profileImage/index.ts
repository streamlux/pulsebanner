import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { ProfileImage } from '@prisma/client';
import { productPlan } from '@app/util/database/paymentHelpers';

const handler = createAuthApiHandler();

// Create or update existing profile picture with url and templateId
handler.post(async (req, res) => {
    await prisma.profileImage.upsert({
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
    const profilePic = await prisma.profileImage.findFirst({
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
    await prisma.profileImage.delete({
        where: {
            userId: req.session.userId,
        },
    });

    res.send(200);
});

// Toggle enabled/disabled
// then update twitch subscriptions
handler.put(async (req, res) => {
    const userId: string = req.session.userId;

    // get the users profile pic
    const profileImage: ProfileImage = await prisma.profileImage.findFirst({
        where: {
            userId,
        },
    });


    if (profileImage) {
        if (!profileImage.enabled) {
            const subscription = await productPlan(userId);
            if (subscription.plan === 'Free' && !(subscription.partner)) {
                res.send(400);
                return;
            }

        }
        await prisma.profileImage.update({
            where: {
                userId,
            },
            data: {
                enabled: !profileImage.enabled,
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
