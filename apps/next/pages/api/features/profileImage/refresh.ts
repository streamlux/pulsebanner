import { createAuthApiHandler } from '@app/util/ssr/createApiHandler';
import prisma from '@app/util/ssr/prisma';
import { ProfileImage } from '@prisma/client';
import { PostgresTwitterInfo, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { getTwitterProfilePic } from '@app/util/twitter/twitterHelpers';

const handler = createAuthApiHandler();

handler.put(async (req, res): Promise<void> => {

    const userId: string = req.session.userId;
    console.log('Refreshing profile image...');

    // We call this when the user wants to update the Twitter profile picture we have stored for them
    const profileImage: ProfileImage = await prisma.profileImage.findUnique({
        where: {
            userId
        }
    });

    if (profileImage) {
        console.log('Got current profile image');
        const twitterInfo: PostgresTwitterInfo = await getTwitterInfo(userId, true);
        const currentTwitterProfilePic: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
        console.log('Got Twitter info and current Twitter profile picture.');

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

        console.log('Finished refreshing Twitter profile picture.');

        res.send(200);
        return;
    }

    res.send(400);
    return;
});


export default handler;
