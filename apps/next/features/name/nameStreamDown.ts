import { getTwitterInfo, flipFeatureEnabled, getOriginalTwitterName } from "@app/util/database/postgresHelpers";
import { validateTwitterAuthentication, getCurrentTwitterName, updateTwitterName } from "@app/util/twitter/twitterHelpers";
import { Feature } from "../Feature";

const nameStreamDown: Feature<string> = async (userId: string): Promise<string> => {
    const twitterInfo = await getTwitterInfo(userId);

    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'banner');
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    if (twitterInfo) {
        // call our db to get the original twitter name
        const originalName = await getOriginalTwitterName(userId);
        const currentTwitterName = await getCurrentTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

        // when received, post to twitter to update
        if (originalName) {
            console.log(`Changing Twitter name from '${currentTwitterName}' to '${originalName.originalName}'.`);
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, originalName.originalName);

            if (response === 200) {
                // just return, we do not need to do anything to the db's on streamdown
                console.log('Successfully updated Twitter name on streamdown.');
                return 'success';
            }
        } else {
            return 'Original name not found in database.';
        }
    }
    return 'Unsuccessful streamdown handling. Could not get twitterInfo.';
}

export default nameStreamDown;
