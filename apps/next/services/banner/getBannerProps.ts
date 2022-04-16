import { GetStreamsResponse, Stream } from "@app/types/twitch";
import { twitchAxios } from "@app/util/axios";
import { Prisma } from "@prisma/client";
import { RenderProps } from "@pulsebanner/remotion/types";
import { AxiosResponse } from "axios";
import { Context } from "../Context";
import { getBannerEntry } from "../postgresHelpers";
import { TwitchClientAuthService } from "../twitch/TwitchClientAuthService";

interface GetBannerPropsData {
    userId: string;
    twitchUserId: string;
}

/**
 * @param context
 * @param data
 * @returns props for rendering the banner with Remotion {@link RenderProps}
 */
export async function getBannerProps(context: Context, data: GetBannerPropsData): Promise<RenderProps> {
    const { userId, twitchUserId } = data;

    // get the banner info saved in Banner table
    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null) {
        throw new Error('Could not find banner entry for user');
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(context, twitchAxios);

    // get twitch user
    // https://dev.twitch.tv/docs/api/reference#get-users
    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
    const twitchUserInfo = userResponse.data.data[0];

    // get twitch stream info for user
    // https://dev.twitch.tv/docs/api/reference#get-streams
    const streamResponse: AxiosResponse<GetStreamsResponse> = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);
    const stream: Stream | undefined = streamResponse.data?.data?.[0];
    if (!stream) {
        context.logger.warn('No stream found getting banner render props', { userId, data: streamResponse.data });
    }

    // get twitch thumbnail, defaulting to the url given by the api, but falling back to a manually constructed one
    const defaultStreamThumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUserInfo.login as string}-440x248.jpg`;
    const streamThumbnailUrlTemplate: string = stream?.thumbnail_url ?? defaultStreamThumbnailUrl;
    const streamThumbnailUrl: string = streamThumbnailUrlTemplate.replace('{width}', '440').replace('{height}', '248');

    return {
        backgroundId: bannerEntry.backgroundId ?? 'CSSBackground',
        foregroundId: bannerEntry.foregroundId ?? 'ImLive',
        // pass in thumbnail url
        foregroundProps: { ...(bannerEntry.foregroundProps as Prisma.JsonObject), thumbnailUrl: streamThumbnailUrl } ?? {},
        backgroundProps: (bannerEntry.backgroundProps as Prisma.JsonObject) ?? {},
    };
}
