import prisma from '@app/util/ssr/prisma';
import type { Prisma } from '@prisma/client';
import { Context } from './Context';
export type Features = keyof Pick<Prisma.UserInclude, 'banner' | 'tweet' | 'twitterName' | 'profileImage'>;
const features: Features[] = ['banner', 'tweet', 'twitterName', 'profileImage'];

export class FeaturesService {
    /**
     * @param context
     * @returns A list containing the features the user has enabled.
     */
    public static async listEnabled(context: Context): Promise<Features[]> {
        const user = await prisma.user.findUnique({
            where: {
                id: context.userId,
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
