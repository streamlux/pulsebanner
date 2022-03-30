import { Context } from "@app/services/Context";
import { Features, FeaturesService } from "@app/services/FeaturesService";
import bannerStreamDown from "./banner/bannerStreamDown";
import bannerStreamUp from "./banner/bannerStreamUp";
import nameStreamDown from "./name/nameStreamDown";
import nameStreamUp from "./name/nameStreamUp";
import profileImageStreamDown from "./profileImage/profileImageStreamDown";
import profileImageStreamUp from "./profileImage/profileImageStreamUp";

export async function executeStreamUp(context: Context, featureList?: Features[]): Promise<void> {
    context.metadata.action = 'streamup';

    const features: Features[] = featureList ?? await FeaturesService.listEnabled(context);
    context.logger.info('Features enabled: ' + features.join(', '), { features });

    features.forEach(async (feature: Features) => {
        if (feature === 'banner') {
            await bannerStreamUp(context);
        }
        if (feature === 'twitterName') {
            await nameStreamUp(context);
        }
        if (feature === 'profileImage') {
            await profileImageStreamUp(context);
        }
    });
}

export async function executeStreamDown(context: Context, featureList?: Features[]): Promise<void> {
    context.metadata.action = 'streamdown';

    const features: Features[] = featureList ?? await FeaturesService.listEnabled(context);
    context.logger.info('Features enabled: ' + features.join(', '), { features });

    features.forEach(async (feature: Features) => {
        if (feature === 'banner') {
            await bannerStreamDown(context);
        }
        if (feature === 'twitterName') {
            await nameStreamDown(context);
        }
        if (feature === 'profileImage') {
            await profileImageStreamDown(context);
        }
    });
}
