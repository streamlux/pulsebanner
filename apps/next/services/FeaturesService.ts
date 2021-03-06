import prisma from '@app/util/ssr/prisma';
import type { Prisma } from '@prisma/client';
export type Features = keyof Pick<Prisma.UserInclude, 'banner' | 'tweet' | 'twitterName' | 'profileImage'>;
const features: Features[] = ['banner', 'tweet', 'twitterName', 'profileImage'];

export class FeaturesService {
    /**
     * @param userId
     * @returns A list containing the features the user has enabled.
     */
    public static async listEnabled(userId: string): Promise<Features[]> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                banner: true,
                tweet: true,
                twitterName: true,
                profileImage: true
            },
            rejectOnNotFound: true,
        });

        const enabledFeatures: Features[] = [];

        features.forEach((feature) => {
            if (user[feature]?.enabled) {
                enabledFeatures.push(feature);
            }
        });

        return enabledFeatures;
    }
}
