import { flipFeatureEnabled, getOriginalTwitterName } from '@app/services/postgresHelpers';
import { logger } from '@app/util/logger';
import { validateTwitterAuthentication, getCurrentTwitterName, updateTwitterName } from '@app/services/twitter/twitterHelpers';
import { Feature } from '../Feature';
import { AccountsService } from '@app/services/AccountsService';

const nameStreamDown: Feature<string> = async (userId: string): Promise<string> => {
    const twitterInfo = await AccountsService.getTwitterInfo(userId);

    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'name');
        logger.error('Unauthenticated Twitter. Disabling feature name and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature name and requiring re-auth.';
    }

    if (twitterInfo) {
        // call our db to get the original twitter name
        const originalName = await getOriginalTwitterName(userId);
        const currentTwitterName = await getCurrentTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

        // when received, post to twitter to update
        if (originalName) {
            logger.info(`Changing Twitter name from '${currentTwitterName}' to '${originalName.originalName}'.`, {
                userId,
                originalName: originalName.originalName,
                liveName: currentTwitterName,
            });
            const response = await updateTwitterName(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, originalName.originalName);

            if (response === 200) {
                // just return, we do not need to do anything to the db's on streamdown
                logger.info('Successfully updated Twitter name on streamdown.', { userId });
                return 'success';
            }
        } else {
            logger.error('Original name not found in database.', {
                userId,
                liveName: currentTwitterName,
            });
            return 'Original name not found in database.';
        }
    }
    logger.error('Unsuccessful streamdown handling. Could not get twitterInfo and complete name change.', { userId });
    return 'Unsuccessful streamdown handling. Could not get twitterInfo.';
};

export default nameStreamDown;
