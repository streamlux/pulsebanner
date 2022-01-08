import { remotionAxios } from '@app/util/axios';
import { getProfilePicEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { getTwitterProfilePic } from '@app/util/twitter/twitterHelpers';
import { Prisma } from '@prisma/client';
import { AxiosResponse } from 'axios';
import { createAuthApiHandler } from '../../../util/ssr/createApiHandler';

type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

const handler = createAuthApiHandler();

handler.get(async (req, res) => {
    if (req.session.role !== 'admin') {
        res.send(401);
    }

    const userId = req.query.userId as string ?? req.session.userId;

    if (userId) {
        const profilePicEntry = await getProfilePicEntry(userId);
        const twitterInfo = await getTwitterInfo(userId, true);

        if (profilePicEntry === null || twitterInfo === null) {
            res.status(400).send('Unable to get profilePicEntry or twitterInfo for user on streamup');
        }


        // get the existing profile pic
        const profilePicUrl: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        const templateObj: TemplateRequestBody = {
            backgroundId: profilePicEntry.backgroundId ?? 'ColorBackground',
            foregroundId: profilePicEntry.foregroundId ?? 'ProfilePic',
            foregroundProps: { ...(profilePicEntry.foregroundProps as Prisma.JsonObject), imageUrl: profilePicUrl } ?? {},
            backgroundProps: { ...(profilePicEntry.backgroundProps as Prisma.JsonObject) } ?? {},
        };

        // pass in the bannerEntry info
        const response: AxiosResponse<string> = await remotionAxios.post('/getProfilePic', templateObj);
        const img = Buffer.from(response.data, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    }
});

export default handler;

