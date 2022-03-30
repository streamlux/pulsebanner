import { TwitchClientAuthService } from '@app/services/twitch/TwitchClientAuthService';
import { twitchAxios } from '../util/axios';
import prisma from '../util/ssr/prisma';
import { getTwitterUserLink } from './twitter/twitterHelpers';
import { AccountsService } from './AccountsService';
import { Context } from './Context';

export type LiveUserInfo = {
    twitterLink: string | null;
    streamId: string | null;
    streamLink: string | null;
    twitchUserId: string | null;
};

export class LiveStreamService {

    public static async getLiveUserInfo(context: Context): Promise<LiveUserInfo | undefined> {
        const userId = context.userId;

        // first call twitter and try and get their twitter username. Handle all error codes gracefully and return null if any come
        const twitterInfo = await AccountsService.getTwitterInfo(userId);
        let twitterLink = null;
        if (twitterInfo && twitterInfo.oauth_token && twitterInfo.oauth_token_secret) {
            twitterLink = await getTwitterUserLink(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
        }
        // get the twitch username/stream link
        const accounts = await AccountsService.getAccountsById(userId);
        if (accounts === null) {
            context.logger.error('Could not find any accounts for this user. ', { userId: userId });
        }
        const twitchUserId = accounts['twitch'].providerAccountId;
        if (twitchUserId === null) {
            context.logger.error('Could not find twitch account information.', { userId: userId });
            return undefined;
        }

        let streamId = null;
        let streamLink = null;

        try {
            const authedTwitchAxios = await TwitchClientAuthService.authAxios(context, twitchAxios);
            const streamResponse = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);

            streamId = streamResponse.data?.data?.[0]?.id; // this will always be null on streamdown.
            if (streamResponse.data?.data.length !== 0) {
                streamLink = streamResponse.data?.data?.[0].user_login ? `https://www.twitch.tv/${streamResponse.data?.data?.[0].user_login}` : null;
            }
        } catch (e) {
            context.logger.error(`Error communicated with twitch: ${e}`, { userId: userId, error: e });
            return undefined;
        }

        return {
            twitterLink: twitterLink,
            streamId: streamId,
            streamLink: streamLink,
            twitchUserId: twitchUserId,
        };
    }

    public static async liveUserOnline(context: Context, userInfo: LiveUserInfo): Promise<void> {
        const userId = context.userId;

        await prisma.liveStreams.upsert({
            where: {
                userId: userId,
            },
            create: {
                userId: userId,
                twitchUserId: userInfo.twitchUserId,
                twitchStreamId: userInfo.streamId,
                twitterLink: userInfo.twitterLink,
                streamLink: userInfo.streamLink,
                startTime: new Date(),
            },
            update: {},
        });

        context.logger.info(`Completed update to live users table for user: ${userId}`);
    }

    public static async liveUserOffline(context: Context, userInfo: LiveUserInfo): Promise<void> {
        const userId = context.userId;

        const liveUser = await prisma.liveStreams.findFirst({
            where: {
                userId: userId,
            },
            select: {
                startTime: true,
                twitchStreamId: true,
            },
        });

        const startTime = liveUser !== null ? liveUser.startTime : null;
        // We have to get this because it will be null on streamdown's in the userInfo section
        const streamId = liveUser !== null ? liveUser.twitchStreamId : null;

        await prisma.pastStreams.create({
            data: {
                userId: userId,
                twitchStreamId: streamId,
                twitchUserId: userInfo.twitchUserId,
                startTime: startTime,
                endTime: new Date(),
            },
        });

        await prisma.liveStreams.deleteMany({
            where: {
                userId: userId,
            },
        });

        context.logger.info(`Completed update to user offline table for user: ${userId}`, { userId: userId });
    }
}
