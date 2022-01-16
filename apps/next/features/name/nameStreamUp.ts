import { productPlan } from "@app/util/database/paymentHelpers";
import { getTwitterInfo, flipFeatureEnabled, getTwitterName, updateOriginalTwitterNameDB } from "@app/util/database/postgresHelpers";
import { validateTwitterAuthentication, getCurrentTwitterName, updateTwitterName } from "@app/util/twitter/twitterHelpers";
import { TwitterName } from "@prisma/client";
import { Feature } from "../Feature";

const nameStreamUp: Feature<string> = async (userId: string): Promise<string> => {
    const twitterInfo = await getTwitterInfo(userId);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'name');
        return 'Unauthenticated Twitter. Disabling feature and requiring re-auth.';
    }

    // get the current twitter name
    const currentTwitterName = await getCurrentTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

    // get the twitter stream name specified in table
    const twitterNameSettings: TwitterName = await getTwitterName(userId);
    if (!twitterNameSettings.enabled) {
        return 'Feature not enabled.';
    }

    let updatedTwitterLiveName = undefined;
    if (twitterNameSettings.streamName && currentTwitterName && twitterNameSettings.streamName.indexOf(currentTwitterName) === -1) {
        // check if they are premium. if they are premium, we cannot do anything
        const plan = await productPlan(userId);

        if (!plan.partner && plan.plan === 'Free') {
            updatedTwitterLiveName = `🔴 Live now | ${currentTwitterName}`;
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${updatedTwitterLiveName}'.`);
        } else {
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${twitterNameSettings.streamName}'.`);
        }
    } else {
        console.log(`Changing Twitter name from '${currentTwitterName}' to '${twitterNameSettings.streamName}'.`);
    }

    // If it is not found return immediately and do not update normal twitwyter name
    if (twitterNameSettings && currentTwitterName !== '') {
        if (updatedTwitterLiveName !== undefined) {
            // post to twitter
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, updatedTwitterLiveName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return 'success';
            }
        } else if (twitterNameSettings.streamName) {
            // post to twitter
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterNameSettings.streamName);

            if (response === 200) {
                await updateOriginalTwitterNameDB(userId, currentTwitterName);
                console.log('Successfully updated Twitter name on streamup.');
                return 'success';
            }
        }
    }
    return 'Error updating Twitter name on streamup';
}

export default nameStreamUp;
