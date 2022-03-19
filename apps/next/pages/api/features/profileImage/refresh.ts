import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import {  getTwitterInfo } from '@app/util/database/postgresHelpers';
import { getTwitterProfilePic } from '@app/util/twitter/twitterHelpers';
import { logger } from '@app/util/logger';

const handler = createAuthApiHandler();

handler.put(async (req, res): Promise<void> => {

    const userId: string = req.session.userId;
    logger.info('Refreshing profile image...');

    // We call this when the user wants to update the Twitter profile picture we have stored for them
    const profileImage = await prisma.profileImage.findUnique({
        where: {
            userId
        }
    });

    if (profileImage) {
        logger.info('Got current profile image');
        const twitterInfo = await getTwitterInfo(userId, true);
        if (!twitterInfo) {
            return res.send(400);
        }
        const currentTwitterProfilePic: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
        logger.info('Got Twitter info and current Twitter profile picture.');

        // by updating this, the next time they stream the profile picture will be rerendered
        await prisma.profileImage.update({
            where: {
                userId
            },
            data: {
                // should be same shape as the props taken by ProfilePic foreground props
                foregroundProps: {
                    ...(profileImage.foregroundProps as any),
                    imageUrl: currentTwitterProfilePic,
                }
            }
        });

        logger.info('Finished refreshing Twitter profile picture.');

        res.send(200);
        return;
    }

    res.send(400);
    return;
});


export default handler;
