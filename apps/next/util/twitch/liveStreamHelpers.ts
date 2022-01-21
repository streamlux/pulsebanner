import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { twitchAxios } from '../axios';
import { getTwitterInfo } from '../database/postgresHelpers';
import { getAccountsById } from '../getAccountsById';
import { logger } from '../logger';
import prisma from '../ssr/prisma';
import { getTwitterUserLink } from '../twitter/twitterHelpers';

export type LiveUserInfo = {
    twitterLink: string | null;
    streamId: string | null;
    streamLink: string | null;
    twitchUserId: string | null;
};

export async function getLiveUserInfo(userId: string): Promise<LiveUserInfo | undefined> {
    // first call twitter and try and get their twitter username. Handle all error codes gracefully and return null if any come
    const twitterInfo = await getTwitterInfo(userId);
    let twitterLink = null;
    if (twitterInfo) {
        twitterLink = await getTwitterUserLink(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    }
    // get the twitch username/stream link
    const accounts = await getAccountsById(userId);
    if (accounts === null) {
        logger.error('Could not find any accounts for this user. ', { userId: userId });
    }
    const twitchUserId = accounts['twitch'].providerAccountId;
    if (twitchUserId === null) {
        logger.error('Could not find twitch account information.', { userId: userId });
        return undefined;
    }

    let streamId = null;
    let streamLink = null;

    try {
        const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
        const streamResponse = await authedTwitchAxios.get(`/helix/streams?id=${twitchUserId}`);

        streamId = streamResponse.data?.data?.[0]?.id;
        streamLink = streamResponse.data?.data?.[0].user_login ? `https://www.twitch.tv/${streamResponse.data?.data?.[0].user_login}` : null;
    } catch (e) {
        logger.error('Error communicated with twitch: ', e, { userId: userId });
        return undefined;
    }

    return {
        twitterLink: twitterLink,
        streamId: streamId,
        streamLink: streamLink,
        twitchUserId: twitchUserId,
    };
}

// change return value
export async function liveUserOnline(userId: string, userInfo: LiveUserInfo): Promise<void> {
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
    logger.info(`Completed update to live users table for user: ${userId}`, { userId: userId });
}

// change return value
export async function liveUserOffline(userId: string, userInfo: LiveUserInfo): Promise<void> {
    const liveUser = await prisma.liveStreams.findFirst({
        where: {
            userId: userId,
        },
        select: {
            startTime: true,
        },
    });

    const startTime = liveUser !== null ? liveUser.startTime : null;

    await prisma.pastStreams.create({
        data: {
            userId: userId,
            twitchStreamId: userInfo.streamId,
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
    logger.info(`Completed update to user offline table for user: ${userId}`, { userId: userId });
}
