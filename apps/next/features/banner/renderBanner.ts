import { TwitchClientAuthService } from "@app/services/twitch/TwitchClientAuthService";
import { GetStreamsResponse, Stream } from "@app/types/twitch";
import { remotionAxios, twitchAxios } from "@app/util/axios";
import { getBannerEntry } from "@app/services/postgresHelpers";
import { logger } from "@app/util/logger";
import type { Prisma } from "@prisma/client";
import type { AxiosResponse } from "axios";

export type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

/**
 * @param userId
 * @param twitchUserId
 * @returns base64 of rendered banner
 */
export const renderBanner = async (userId: string, twitchUserId: string): Promise<string> => {
    // get the banner info saved in Banner table
    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null) {
        throw new Error('Could not find banner entry for user');
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

    // get twitch user
    // https://dev.twitch.tv/docs/api/reference#get-users
    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
    const twitchUserInfo = userResponse.data.data[0];

    // get twitch stream info for user
    // https://dev.twitch.tv/docs/api/reference#get-streams
    const streamResponse: AxiosResponse<GetStreamsResponse> = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);
    const stream: Stream | undefined = streamResponse.data?.data?.[0];
    if (!stream) {
        logger.warn('No stream found trying to render banner', { userId, data: streamResponse.data });
    }

    // get twitch thumbnail, defaulting to the url given by the api, but falling back to a manually constructed one
    const defaultStreamThumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUserInfo.login as string}-440x248.jpg`;
    const streamThumbnailUrlTemplate: string = stream?.thumbnail_url ?? defaultStreamThumbnailUrl;
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
    const base64Image: string = response.data;

    return base64Image;
}
