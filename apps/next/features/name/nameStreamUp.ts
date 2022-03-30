import { productPlan } from '@app/services/payment/paymentHelpers';
import { flipFeatureEnabled, getTwitterName, updateOriginalTwitterNameDB } from '@app/services/postgresHelpers';
import prisma from '@app/util/ssr/prisma';
import { validateTwitterAuthentication, getCurrentTwitterName, updateTwitterName } from '@app/services/twitter/twitterHelpers';
import { Feature } from '../Feature';
import { AccountsService } from '@app/services/AccountsService';
import { Context } from '@app/services/Context';

const nameStreamUp: Feature<string> = async (context: Context): Promise<string> => {
    const { userId } = context;
    const twitterInfo = await AccountsService.getTwitterInfo(userId);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(context, 'name');
        context.logger.error('Unauthenticated Twitter. Disabling feature name and requiring re-auth.');
        return 'Unauthenticated Twitter. Disabling feature name and requiring re-auth.';
    }

    // get the current twitter name
    const currentTwitterName = await getCurrentTwitterName(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

    // get the twitter stream name specified in table
    const twitterNameSettings = await getTwitterName(userId);
    if (!twitterNameSettings?.enabled) {
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
            context.logger.info(`User changed their Twitter username. Updating live name from '${twitterNameSettings.streamName}' to '${liveTwitterName}'.`, {
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

    context.logger.info(`Changing Twitter name from '${currentTwitterName}' to '${liveTwitterName}'.`, {
        originalName: currentTwitterName,
        liveName: liveTwitterName,
        truncatedLiveTwitterName
    });

    // If it is not found return immediately and do not update normal twitwyter name
    if (twitterNameSettings && currentTwitterName !== '') {
        const response = await updateTwitterName(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, truncatedLiveTwitterName);

        if (response === 200) {
            await updateOriginalTwitterNameDB(userId, currentTwitterName);
            context.logger.info('Successfully updated Twitter name on streamup.');
            return 'success';
        }
    }
    return 'Error updating Twitter name on streamup';
};

export default nameStreamUp;
