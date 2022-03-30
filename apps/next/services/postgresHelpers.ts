import { Banner, Tweet, TwitterName, TwitterOriginalName } from '@prisma/client';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
import prisma from '../util/ssr/prisma';
import { Context } from './Context';

export type PostgresTwitterInfo = {
    oauth_token: string;
    oauth_token_secret: string;
    providerAccountId: string;
};

export const getBannerEntry = async (userId: string): Promise<Banner | null> => {
    const banner = await prisma.banner?.findFirst({
        where: {
            userId: userId,
        },
    });
    return banner;
};

export const getTwitterInfo = async (userId: string, getProviderAccountId = false): Promise<Required<PostgresTwitterInfo>> => {
    const twitterInfo = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
            providerAccountId: getProviderAccountId,
        },
        rejectOnNotFound: true
    });

    return twitterInfo as Required<PostgresTwitterInfo>;
};

export const getTweetInfo = async (userId: string): Promise<Tweet | null> => {
    const tweet = await prisma.tweet?.findFirst({
        where: {
            userId: userId,
        },
    });

    return tweet;
};

export const getTwitterName = async (userId: string): Promise<TwitterName | null> => {
    const twitterName = await prisma.twitterName?.findFirst({
        where: {
            userId: userId,
        },
    });

    return twitterName;
};

export const getOriginalTwitterName = async (userId: string): Promise<TwitterOriginalName | null> => {
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

export const flipFeatureEnabled = async (context: Context, feature: string, forceDisable?: boolean): Promise<void> => {
    const { userId } = context;
    if (feature === 'banner') {
        const banner = await prisma.banner.findFirst({
            where: {
                userId,
            },
        });

        if (banner) {
            await prisma.banner.update({
                where: {
                    userId,
                },
                data: {
                    enabled: forceDisable ? false : !banner.enabled,
                },
            });

            // Update twitch subscriptions since we might
            // need to delete subscriptions if they disabled the banner
            // or create subscriptions if they enabled the banner
            await updateTwitchSubscriptions(context);
        }
    } else if (feature === 'name') {
        const twitterName = await prisma.twitterName.findFirst({
            where: {
                userId,
            },
        });

        if (twitterName) {
            await prisma.twitterName.update({
                where: {
                    userId,
                },
                data: {
                    enabled: forceDisable ? false : !twitterName.enabled,
                },
            });

            // Update twitch subscriptions since we might
            // need to delete subscriptions if they disabled the banner
            // or create subscriptions if they enabled the banner
            await updateTwitchSubscriptions(context);
        }
    } else if (feature === 'profileImage') {
        const profileImage = await prisma.profileImage.findFirst({
            where: {
                userId,
            },
        });

        if (profileImage) {
            await prisma.profileImage.update({
                where: {
                    userId,
                },
                data: {
                    enabled: forceDisable ? false : !profileImage.enabled,
                },
            });
        }
    }
};
