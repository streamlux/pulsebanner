import { productPlan } from '@app/util/database/paymentHelpers';
import { getTwitterInfo, flipFeatureEnabled, getTwitterName, updateOriginalTwitterNameDB } from '@app/util/database/postgresHelpers';
import { logger } from '@app/util/logger';
import prisma from '@app/util/ssr/prisma';
import { validateTwitterAuthentication, getCurrentTwitterName, updateTwitterName } from '@app/util/twitter/twitterHelpers';
import { TwitterName } from '@prisma/client';
import { Feature } from '../Feature';

const nameStreamUp: Feature<string> = async (userId: string): Promise<string> => {
    const twitterInfo = await getTwitterInfo(userId);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'name');
        logger.error('Unauthenticated Twitter. Disabling feature name and requiring re-auth.');
        return 'Unauthenticated Twitter. Disabling feature name and requiring re-auth.';
    }

    // get the current twitter name
    const currentTwitterName = await getCurrentTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

    // get the twitter stream name specified in table
    const twitterNameSettings: TwitterName = await getTwitterName(userId);
    if (!twitterNameSettings.enabled) {
        return 'Feature not enabled.';
    }

    let liveTwitterName: string = twitterNameSettings.streamName;

    // check if the user has changed their twitter name, if so, we can update free users names automatically
    if (twitterNameSettings.streamName && currentTwitterName && twitterNameSettings.streamName.indexOf(currentTwitterName) === -1) {
        // check if they are premium. if they are premium, we cannot do anything
        const plan = await productPlan(userId);

        // check if the user is on the free plan
        if (!plan.partner && plan.plan === 'Free') {
            liveTwitterName = `🔴 Live now | ${currentTwitterName}`;
            logger.info(`User changed their Twitter username. Updating live name from '${twitterNameSettings.streamName}' to '${liveTwitterName}'.`, {
                userId,
                originalName: currentTwitterName,
                oldName: twitterNameSettings.streamName,
                newName: liveTwitterName,
            });

            // Update the live name in the database so next time we don't have to
            await prisma.twitterName.update({
                where: {
                    userId,
                },
                data: {
                    streamName: liveTwitterName,
                }
            });
        }
    }

    // twitter limits usernames to 50 characters
    const truncatedLiveTwitterName = liveTwitterName.substring(0, 49);

    logger.info(`Changing Twitter name from '${currentTwitterName}' to '${liveTwitterName}'.`, {
        userId,
        originalName: currentTwitterName,
        liveName: liveTwitterName,
        truncatedLiveTwitterName
    });

    // If it is not found return immediately and do not update normal twitwyter name
    if (twitterNameSettings && currentTwitterName !== '') {
        const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, truncatedLiveTwitterName);

        if (response === 200) {
            await updateOriginalTwitterNameDB(userId, currentTwitterName);
            logger.info('Successfully updated Twitter name on streamup.', { userId });
            return 'success';
        }
    }
    return 'Error updating Twitter name on streamup';
};

export default nameStreamUp;
