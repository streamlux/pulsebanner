import { Account, Banner, ProfileImage, RenderedProfileImage, Tweet, TwitterName, TwitterOriginalName } from '@prisma/client';
import { updateTwitchSubscriptions } from '@app/services/updateTwitchSubscriptions';
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

export const getProfilePicEntry = async (userId: string): Promise<ProfileImage> => {
    const profilePic = await prisma.profileImage.findFirst({
        where: {
            userId: userId,
        },
    });

    return profilePic;
};

/**
 *
 * @param userId
 * @returns null if it doesn't exist
 */
export const getProfilePicRendered = async (userId: string): Promise<RenderedProfileImage | null> => {
    const profilePicRendered = await prisma.renderedProfileImage.findFirst({
        where: {
            userId: userId,
        },
    });

    return profilePicRendered;
};

export const updateProfilePicRenderedDB = async (userId: string): Promise<void> => {
    await prisma.renderedProfileImage.upsert({
        where: {
            userId: userId,
        },
        create: {
            userId: userId,
            lastRendered: new Date(),
        },
        update: {
            lastRendered: new Date(),
        },
    });
};
export const getAccountInfo = async (userId: string): Promise<Partial<Account>> => {
    const response = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'twitter',
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
        },
    });
    return response;
};

export const flipFeatureEnabled = async (userId: string, feature: string): Promise<void> => {
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
                    enabled: !banner.enabled,
                },
            });

            // Update twitch subscriptions since we might
            // need to delete subscriptions if they disabled the banner
            // or create subscriptions if they enabled the banner
            await updateTwitchSubscriptions(userId);
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
                    enabled: !twitterName.enabled,
                },
            });

            // Update twitch subscriptions since we might
            // need to delete subscriptions if they disabled the banner
            // or create subscriptions if they enabled the banner
            await updateTwitchSubscriptions(userId);
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
                    enabled: !profileImage.enabled,
                },
            });
        }
    }
};
