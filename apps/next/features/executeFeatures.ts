import { Features, FeaturesService } from "@app/services/FeaturesService";
import { logger } from "@app/util/logger";
import bannerStreamDown from "./banner/bannerStreamDown";
import bannerStreamUp from "./banner/bannerStreamUp";
import nameStreamDown from "./name/nameStreamDown";
import nameStreamUp from "./name/nameStreamUp";
import profileImageStreamDown from "./profileImage/profileImageStreamDown";
import profileImageStreamUp from "./profileImage/profileImageStreamUp";

export async function executeStreamUp(userId: string, featureList?: Features[]): Promise<void> {
    const features: Features[] = featureList ?? await FeaturesService.listEnabled(userId);
    logger.info('Features enabled: ' + features.join(', '), { features });

    features.forEach(async (feature: Features) => {
        if (feature === 'banner') {
            await bannerStreamUp(userId);
        }
        if (feature === 'twitterName') {
            await nameStreamUp(userId);
        }
        if (feature === 'profileImage') {
            await profileImageStreamUp(userId);
        }
    });
}

export async function executeStreamDown(userId: string, featureList?: Features[]): Promise<void> {
    const features: Features[] = featureList ?? await FeaturesService.listEnabled(userId);
    logger.info('Features enabled: ' + features.join(', '), { features });

    features.forEach(async (feature: Features) => {
        if (feature === 'banner') {
            await bannerStreamDown(userId);
        }
        if (feature === 'twitterName') {
            await nameStreamDown(userId);
        }
        if (feature === 'profileImage') {
            await profileImageStreamDown(userId);
        }
    });
}
