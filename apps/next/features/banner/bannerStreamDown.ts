import { getBannerEntry, flipFeatureEnabled } from '@app/services/postgresHelpers';
import { validateTwitterAuthentication, TwitterResponseCode, updateBanner } from '@app/services/twitter/twitterHelpers';
import { Feature } from '../Feature';
import env from '@app/util/env';
import { S3Service } from '@app/services/S3Service';
import { AccountsService } from '@app/services/AccountsService';
import { Context } from '@app/services/Context';

const bannerStreamDown: Feature<string> = async (context: Context): Promise<string> => {
    context.metadata.feature = 'banner';
    const { userId } = context;

    const bannerEntry = await getBannerEntry(userId);

    const twitterInfo = await AccountsService.getTwitterInfo(userId);

    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(context, 'banner');
        context.logger.error('Unauthenticated Twitter. Disabling feature banner and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    if (bannerEntry === null || twitterInfo === null) {
        return 'Could not find banner entry or token info for user';
    }

    // Download original image from S3.
    let imageBase64 = await S3Service.download(context, env.IMAGE_BUCKET_NAME, userId);
    if (imageBase64) {
        context.logger.info('Successfully downloaded original image from S3.', { userId });
    } else {
        // retry to download one more time, then fail otherwise
        imageBase64 = await S3Service.download(context, env.IMAGE_BUCKET_NAME, userId);
        if (imageBase64) {
            context.logger.info('Successfully downloaded original image from S3.', { userId });
        } else {
            context.logger.error('Failed to download original image from S3.', { userId });
            return 'Failed to get original image from S3.';
        }
    }

    // validate the image is proper base64. If not, upload the signup image
    if (!S3Service.checkValidDownload(imageBase64)) {
        context.logger.error('Invalid base64 in do. Uploading signup image', { userId });
        const original = await S3Service.download(context, env.BANNER_BACKUP_BUCKET, userId);
        if (!S3Service.checkValidDownload(original ?? '')) {
            context.logger.error('Failing streamdown. Invalid original image as well as signup image.', { userId });
            return 'Failing streamdown. Invalid original image as well as signup image.';
        } else {
            imageBase64 = original;
        }
    }

    // add check for if it is 'empty' string, then we just set back to default (remove the current banner)
    const bannerStatus: TwitterResponseCode = await updateBanner(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, imageBase64 ?? '');
    if (bannerStatus === 200) {
        return 'Successfully set banner back to original image.';
    } else {
        context.logger.error('Failed to set banner back original image.', { userId });
        return 'Failed to set banner to original image.';
    }
};

export default bannerStreamDown;
