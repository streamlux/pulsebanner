import { AccountsService } from '@app/services/AccountsService';
import { TwitchClientAuthService } from '@app/services/twitch/TwitchClientAuthService';
import { remotionAxios, twitchAxios } from '@app/util/axios';
import { getBannerEntry } from '@app/services/postgresHelpers';
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

    const accounts = await AccountsService.getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or twitter info for user');
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

    // get twitch stream info for user
    // https://dev.twitch.tv/docs/api/reference#get-streams
    const streamResponse = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);

    // get twitch user
    // https://dev.twitch.tv/docs/api/reference#get-users
    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
    const twitchUserInfo = userResponse.data.data[0];

    // get twitch thumbnail, defaulting to the url given by the api, but falling back to a manually constructed one
    const defaultStreamThumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUserInfo.login}-440x248.jpg`;
    const streamThumbnailUrlTemplate: string = streamResponse.data?.data?.[0]?.thumbnail_url ?? defaultStreamThumbnailUrl;
    const streamThumbnailUrl: string = streamThumbnailUrlTemplate.replace('{width}', '440').replace('{height}', '248');

    // construct template object
    const templateObj: TemplateRequestBody = {
        backgroundId: bannerEntry.backgroundId ?? 'CSSBackground',
        foregroundId: bannerEntry.foregroundId ?? 'ImLive',
        // pass in thumbnail url
        foregroundProps: { ...(bannerEntry.foregroundProps as Prisma.JsonObject), thumbnailUrl: streamThumbnailUrl } ?? {},
        backgroundProps: (bannerEntry.backgroundProps as Prisma.JsonObject) ?? {},
    };

    // pass in the bannerEntry info
    const response: AxiosResponse<string> = await remotionAxios.post('/getTemplate', templateObj);
    const img = Buffer.from(response.data, 'base64');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
});

export default handler;
