import { TwitchClientAuthService } from '@app/services/TwitchClientAuthService';
import { twitchAxios } from '../axios';
import { getTwitterInfo } from '../database/postgresHelpers';
import { getAccountsById } from '../getAccountsById';
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
        console.log('error getting info');
    }
    const twitchUserId = accounts['twitch'].providerAccountId;
    if (twitchUserId === null) {
        console.log('error gettging twitch');
    }

    let streamId = null;
    let streamLink = null;

    try {
        const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);
        const streamResponse = await authedTwitchAxios.get(`/helix/streams?id=${twitchUserId}`);

        console.log('streamResponse data: ', streamResponse.data);

        streamId = streamResponse.data?.data?.[0]?.id;
        streamLink = streamResponse.data?.data?.[0].user_login ? `https://www.twitch.tv/${streamResponse.data?.data?.[0].user_login}` : null;
    } catch (e) {
        console.log('error: ', e);
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
    await prisma.liveUsers.upsert({
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
}

// change return value
export async function liveUserOffline(userId: string, userInfo: LiveUserInfo): Promise<void> {
    const liveUser = await prisma.liveUsers.findFirst({
        where: {
            userId: userId,
        },
        select: {
            startTime: true,
        },
    });

    const startTime = liveUser !== null ? liveUser.startTime : null;

    await prisma.pastLiveUsers.create({
        data: {
            userId: userId,
            twitchStreamId: userInfo.streamId,
            twitchUserId: userInfo.twitchUserId,
            startTime: startTime,
            endTime: new Date(),
        },
    });

    await prisma.liveUsers.deleteMany({
        where: {
            userId: userId,
        },
    });
}
