export type Features = keyof Pick<Prisma.UserInclude, 'banner' | 'tweet'>;
const features: Features[] = ['banner', 'tweet'];

export class FeaturesService {
    public static async listEnabled(userId: string): Promise<Features[]> {


        const user = await prisma.user?.findFirst({
            where: {
                id: userId,
            },
            include: {
                banner: true,
                tweet: true
            }
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
