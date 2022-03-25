import { flipFeatureEnabled, getBannerEntry } from '@app/services/postgresHelpers';
import { validateTwitterAuthentication, getBanner, TwitterResponseCode, updateBanner } from '@app/services/twitter/twitterHelpers';
import imageToBase64 from 'image-to-base64';
import { Feature } from '../Feature';
import { logger } from '@app/util/logger';
import { renderBanner } from './renderBanner';
import env from '@app/util/env';
import { AccountsService } from '@app/services/AccountsService';
import { S3Service } from '@app/services/S3Service';

export type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

const bannerStreamUp: Feature<string> = async (userId: string): Promise<string> => {
    const accounts = await AccountsService.getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    if (!twitchUserId) {
        return 'Missing twitchUserId';
    }

    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'banner');
        logger.error('Unauthenticated Twitter. Disabling feature banner and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    // get the banner info saved in Banner table
    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null || twitterInfo === null) {
        return 'Could not find banner entry or twitter info for user';
    }

    // if they don't have an original banner, then upload their current twitter banner as the original banner
    try {
        const bucketName = env.IMAGE_BUCKET_NAME;
        const originalBanner: string | undefined = await S3Service.download(bucketName, userId);
        if (!originalBanner) {
            logger.info('Fetching and uploading Twitter banner for user.', { userId });
            // call twitter api to get imageUrl and convert to base64
            const bannerUrl: string = await getBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

            // https://stackoverflow.com/a/58158656/10237052

            logger.info('bannerUrl', { bannerUrl, userId });

            // store the current banner in s3
            let dataToUpload: string = bannerUrl === 'empty' ? 'empty' : await imageToBase64(bannerUrl);

            const validDownload = S3Service.checkValidDownload(dataToUpload);

            logger.info('validation - dataToUpload correct on streamup: ', { valid: validDownload });
            if (!validDownload) {
                // just print first 10 chars of base64 to see what is invalid
                logger.warn(`incorrect data. userid: ${userId}\tdataToUpload: ${dataToUpload.substring(0, 10)} `, { userId, string: dataToUpload.substring(0, 10) });
                // attempt to re-fetch
                const refetch = await imageToBase64(bannerUrl);
                // check valid download once more
                if (!S3Service.checkValidDownload(refetch)) {
                    // if we are invalid again, fail the request
                    logger.error('Corrupt base64 image. Uploading signup image');
                    const original = await S3Service.download(env.BANNER_BACKUP_BUCKET, userId);
                    if (!original || !S3Service.checkValidDownload(original)) {
                        logger.error('Corrupt signup image. Failing request');
                        return 'Corrupt signup image. Failing request';
                    } else {
                        dataToUpload = original;
                    }
                } else {
                    dataToUpload = refetch;
                }
            }

            await S3Service.uploadBase64(bucketName, userId, dataToUpload);
        }
    } catch (e) {
        logger.error('Error uploading original banner to S3', { userId });
        return 'Error uploading original banner to S3.';
    }

    let base64Image: string;
    try {
        base64Image = await renderBanner(userId, twitchUserId);
    } catch (e) {
        logger.error('Error rendering banner on streamup', { userId, error: e });
        return 'Error rendiering banner on stream up.';
    }

    // post this base64 image to twitter
    const bannerStatus: TwitterResponseCode = await updateBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return bannerStatus === 200 ? 'Set banner to given template' : 'Unable to set banner';
};

export default bannerStreamUp;
