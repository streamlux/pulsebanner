import { Banner } from ".prisma/client";

export type PostgresTwitterInfo = {
    oauth_token: string;
    oauth_token_secret: string;
    providerAccountId?: string;
}

export const getBannerEntry = async (userId: string): Promise<Banner> => {
    const banner = await prisma.banner?.findFirst({
        where: {
            userId
        }
    });
    return banner;
}

export const getTwitterInfo = async (userId: string, getProviderAccountId = false): Promise<PostgresTwitterInfo> => {
    const twitterInfo: PostgresTwitterInfo = await prisma.account?.findFirst({
        where: {
            userId,
        },
        select: {
            oauth_token: true,
            oauth_token_secret: true,
            providerAccountId: getProviderAccountId,
        },
    });

    return twitterInfo;
}
