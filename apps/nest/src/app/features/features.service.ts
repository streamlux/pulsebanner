import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type Features = keyof Pick<Prisma.UserInclude, 'banner' | 'tweet'>;
const features: Features[] = ['banner', 'tweet'];

@Injectable()
export class FeaturesService {

    constructor(private prisma: PrismaService) { }

    /**
 * @param userId
 * @returns A list containing the features the user has enabled.
 */
    public async listEnabled(userId: string): Promise<Features[]> {

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                banner: true,
                tweet: true
            },
            rejectOnNotFound: true
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
