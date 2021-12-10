import prisma from '@app/util/ssr/prisma';
import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';

const handler = createAuthApiHandler();

handler.post(async (req, res) => {
    const userId = req.session.userId;
    console.log(`handling save now for user: ${userId}`);
    if (userId) {
        await prisma.twitchTweet.upsert({
            where: {
                userId: userId,
            },
            create: {
                userId: userId,
                tweetInfo: req.body.tweetInfo,
                streamUrl: req.body.streamUrl, // call an api endpoint if they choose to include this, then set the state on press
            },
            update: {
                userId: userId,
                tweetInfo: req.body.tweetInfo,
                streamUrl: req.body.streamUrl,
            },
        });
    }
    res.status(200).send('success');
});

handler.get(async (req, res) => {
    const tweet = await prisma.twitchTweet.findFirst({
        where: {
            userId: req.session.userId,
        },
        select: {
            enabled: true,
            streamUrl: true,
            tweetInfo: true,
        },
    });

    res.json(tweet);
});

// Toggle enabled/disabled
// then update twitch subscriptions
handler.put(async (req, res) => {
    const userId = req.session.userId;

    const tweet = await prisma.twitchTweet.findFirst({
        where: {
            userId,
        },
    });

    if (tweet) {
        await prisma.banner.update({
            where: {
                userId,
            },
            data: {
                enabled: !tweet.enabled,
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
