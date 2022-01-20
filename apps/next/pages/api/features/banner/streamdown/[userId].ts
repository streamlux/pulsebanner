import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { TwitterResponseCode, updateBanner, validateTwitterAuthentication } from '@app/util/twitter/twitterHelpers';
import { flipFeatureEnabled, getBannerEntry, getTwitterInfo } from '@app/util/database/postgresHelpers';
import { env } from 'process';
import { download } from '@app/util/s3/download';
import { logger } from '@app/util/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const userId: string = req.query.userId as string;

    const bannerEntry = await getBannerEntry(userId);

    const twitterInfo = await getTwitterInfo(userId);

    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'banner');
        return res.status(401).send('Unauthenticated Twitter. Disabling feature banner and requiring re-auth.');
    }

    if (bannerEntry === null || twitterInfo === null) {
        return res.status(400).send('Could not find banner entry or token info for user');
    }

    // Download original image from S3.
    const imageBase64: string = await download(env.IMAGE_BUCKET_NAME, userId);
    if (imageBase64) {
        logger.info('Successfully downloaded original image from S3.', { userId });
    } else {
        logger.error('Failed to download original image from S3.', { userId });
        return res.status(404).send('Failed to get original image from S3.');
    }

    // validate the image is proper base64. If not, upload the signup image
    // if (!checkValidDownload(imageBase64)) {
    //     console.log('Invalid base64 in do. Uploading signup image');
    //     const original = await download(env.BANNER_BACKUP_BUCKET, userId);
    //     if (!checkValidDownload(original)) {
    //         console.log('Failing streamdown. Invalid original image as well');
    //         return res.status(400).send('Failing streamdown. Invalid original image as well');
    //     } else {
    //         imageBase64 = original;
    //     }
    // }

    // add check for if it is 'empty' string, then we just set back to default (remove the current banner)
    const bannerStatus: TwitterResponseCode = await updateBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, imageBase64);
    if (bannerStatus === 200) {
        return res.status(200).send('Successfully set banner back to original image.');
    } else {
        console.error('Failed to set banner back original image.');
        return res.status(400).send('Failed to set banner to original image.');
    }
}
