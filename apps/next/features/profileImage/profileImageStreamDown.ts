import { flipFeatureEnabled } from '@app/services/postgresHelpers';
import env from '@app/util/env';
import { logger } from '@app/util/logger';
import { TwitterResponseCode, updateProfilePic, validateTwitterAuthentication } from '@app/services/twitter/twitterHelpers';
import { Feature } from '../Feature';
import { S3Service } from '@app/services/S3Service';
import { AccountsService } from '@app/services/AccountsService';
import { ProfilePicService } from '@app/services/ProfilePicService';
import { Context } from '@app/services/Context';

const profileImageStreamDown: Feature<string> = async (context: Context): Promise<string> => {
    const bucketName: string = env.PROFILE_PIC_BUCKET_NAME;
    const { userId } = context;

    const profilePicInfo = await ProfilePicService.getProfilePicEntry(userId);

    const twitterInfo = await AccountsService.getTwitterInfo(userId);

    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(context, 'profileImage');
        logger.error('Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.';
    }

    if (profilePicInfo === null || twitterInfo === null) {
        logger.error('Could not find profile pic entry or twitter info for user', { userId });
        return 'Could not find profile pic entry or twitter info for user';
    }

    // get the original image from the
    // const response = await localAxios.get(`/api/storage/download/${userId}`);
    const base64Image: string | undefined = await S3Service.download(context, bucketName, userId);

    if (base64Image === undefined) {
        logger.error('Unable to find user in database for profile picture on streamdown. This can be caused by the user enabling the feature while currently live.', { userId });
        return 'Unable to find user in database for profile pic on streamdown. This can be caused by the user enabling the feature while currently live.';
    }

    const profilePicStatus: TwitterResponseCode = await updateProfilePic(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return profilePicStatus === 200 ? 'Set profile pic back to original image' : 'Unable to set profile pic to original image';
};

export default profileImageStreamDown;
