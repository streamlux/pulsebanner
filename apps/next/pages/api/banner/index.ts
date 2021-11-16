import prisma from '../../../util/ssr/prisma';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';
import { Account } from '@prisma/client';
import Twitter from 'twitter-lite';

const handler = createAuthApiHandler();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchBanner(account: Account): Promise<string> {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_ID,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token_key: account.oauth_token,
        access_token_secret: account.oauth_token_secret,
    });

    try {
        // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-users-profile_banner
        const response = await client.get('users/profile_banner', {
            user_id: account.providerAccountId,
        });

        const url = response.sizes['1500x500'].url;
        return url;
    } catch (e) {
        console.error('Failed to get Twitter profile banner.');
        throw e;
    }
}

handler.post(async (req, res) => {

    // Create or update existing banner with url and templateId
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

handler.get(async (req, res) => {
    // Get banner
    const banner = await prisma.banner.findFirst({
        where: {
            userId: req.session.userId,
        },
        select: {
            enabled: true,
            backgroundId: true,
            backgroundProps: true,
            foregroundId: true,
            foregroundProps: true
        },
    });

    res.json(banner);
});

handler.delete(async (req, res) => {
    // Delete banner
    await prisma.banner.delete({
        where: {
            userId: req.session.userId,
        },
    });

    res.send(200);
});

// Toggle enabled/disabled
handler.put(async (req, res) => {
    console.log('Hit toggle banner');

    const banner = await prisma.banner.findFirst({
        where: {
            userId: req.session.userId,
        },
    });

    if (banner) {
        await prisma.banner.update({
            where: {
                userId: req.session.userId,
            },
            data: {
                enabled: !banner.enabled,
            },
        });

        console.log('Toggled banner');
        res.send(200);
    } else {
        res.send(404);
    }
});

export default handler;
