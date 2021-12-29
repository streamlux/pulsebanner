import { Banner, Tweet, TwitterName, TwitterOriginalName } from '@prisma/client';
import prisma from '../ssr/prisma';

export type PostgresTwitterInfo = {
    oauth_token: string;
    oauth_token_secret: string;
    providerAccountId?: string;
};

export const getBannerEntry = async (userId: string): Promise<Banner> => {
    const banner = await prisma.banner?.findFirst({
        where: {
            userId: userId,
        },
    });
    return banner;
};

export const getTwitterInfo = async (userId: string, getProviderAccountId = false): Promise<PostgresTwitterInfo> => {
    const twitterInfo: PostgresTwitterInfo = await prisma.account?.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
            providerAccountId: getProviderAccountId,
        },
    });

    return twitterInfo;
};

export const getTweetInfo = async (userId: string): Promise<Tweet> => {
    const tweet = await prisma.tweet?.findFirst({
        where: {
            userId: userId,
        },
    });

    return tweet;
};

export const getTwitterName = async (userId: string): Promise<TwitterName> => {
    const twitterName = await prisma.twitterName?.findFirst({
        where: {
            userId: userId,
        },
    });

    return twitterName;
};

export const getOriginalTwitterName = async (userId: string): Promise<TwitterOriginalName> => {
    const originalTwitterName = await prisma.twitterOriginalName?.findFirst({
        where: {
            userId: userId,
        },
    });

    return originalTwitterName;
};

export const updateOriginalTwitterNameDB = async (userId: string, name: string): Promise<void> => {
    await prisma.twitterOriginalName?.upsert({
        where: {
            userId: userId,
        },
        create: {
            userId: userId,
            originalName: name,
        },
        update: {
            originalName: name,
        },
    });
};

export const getAccountTwitterTokenStatus = async (userId: string): Promise<boolean> => {
    const response = await prisma.account?.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            reconnect_twitter: true,
        },
    });

    if (response !== null && response.reconnect_twitter === true) {
        return true;
    }
    return false;
};

// we have to make sure to delete the old twitter info from the db
export const updateAccountTwitterToken = async (userId: string, tokenStatus: boolean): Promise<void> => {
    // this is a hacky way to not have to fetch the id. Since userId is not unique (also stores twitch), we must use updatemany and just get twitter (should only be one)
    await prisma.account?.updateMany({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        data: {
            reconnect_twitter: tokenStatus,
        },
    });
};
