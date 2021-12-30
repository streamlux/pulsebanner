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

export const existingTwitterAuthIssue = async (userId: string): Promise<boolean> => {
    const response = await prisma.reauthenticateUsers.findFirst({
        where: {
            userId: userId,
        },
    });

    if (response === null) {
        return false;
    }
    return true;
};

export const addTwitterReauth = async (userId: string, email?: string): Promise<void> => {
    await prisma.reauthenticateUsers?.upsert({
        where: {
            userId: userId,
        },
        create: {
            userId: userId,
            email: email,
        },
        update: {
            email: email,
        },
    });
};
