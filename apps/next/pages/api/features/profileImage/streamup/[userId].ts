import { remotionAxios } from '@app/util/axios';
import { getProfilePicEntry, getProfilePicRendered, getTwitterInfo, updateProfilePicRenderedDB } from '@app/util/database/postgresHelpers';
import { getTwitterProfilePic, TwitterResponseCode, updateProfilePic } from '@app/util/twitter/twitterHelpers';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { AxiosResponse } from 'axios';
import { env } from 'process';
import { TemplateRequestBody } from '../../banner/streamup/[userId]';
import { Prisma, RenderedProfileImage } from '@prisma/client';
import imageToBase64 from 'image-to-base64';
import { uploadBase64 } from '@app/util/s3/upload';
import { download } from '@app/util/s3/download';
import { logger } from '@app/util/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        methods: ['GET', 'POST'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    // logic for this
    /**
    when a user goes live, we check the timestamp of when they last edited their profile picture settings
    if the timestamp is more recent than the timestamp of the generated profile picture (if one exists) then we need to regenerate their profile picture with the updated settings
    else we can use the already generated profile picture (aka. cached)
     */

    const userId: string = req.query.userId as string;

    if (userId) {
        const profilePicEntry = await getProfilePicEntry(userId);
        const profilePicRendered: RenderedProfileImage | null = await getProfilePicRendered(userId); // compare to updatedAt time and only update if later
        const twitterInfo = await getTwitterInfo(userId, true);

        if (profilePicEntry === null || twitterInfo === null) {
            res.status(400).send('Unable to get profilePicEntry or twitterInfo for user on streamup');
        }

        // profile pic bucket name
        const profilePicBucketName: string = env.PROFILE_PIC_BUCKET_NAME;
        const profilePicCacheBucketName: string = env.PROFILE_PIC_CACHE_BUCKET;

        // get the existing profile pic
        const profilePicUrl: string = await getTwitterProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

        //upload profilePicUrl as base64 to s3 storage
        const dataToUpload: string = profilePicUrl === 'empty' ? 'empty' : await imageToBase64(profilePicUrl);
        try {
            await uploadBase64(profilePicBucketName, userId, dataToUpload);
        } catch (e) {
            logger.error('Error uploading original profile picture to S3.', { userId });
            return res.status(500).send('Error uploading original banner to S3.');
        }

        const templateObj: TemplateRequestBody = {
            backgroundId: profilePicEntry.backgroundId ?? 'CSSBackground',
            foregroundId: profilePicEntry.foregroundId ?? 'ProfilePic',
            foregroundProps: { ...(profilePicEntry.foregroundProps as Prisma.JsonObject) } ?? {},
            backgroundProps: (profilePicEntry.backgroundProps as Prisma.JsonObject) ?? {},
        };

        // check here if we have previously rendered the profile picture. Update if they have saved more recent than what we have saved in the render time

        let cachedImage: string | undefined = undefined;
        try {
            // if we do not have the image in s3, we also need to remove it
            cachedImage = await download(profilePicCacheBucketName, userId);
        } catch (e) {
            // we hit this case only in the following situation
            // a) The user does not have anything in the db for themselves (i.e. first time)
        }

        // if we do not have anything stored for the current profilePicRendered, do not have a cachedImage, or have updated the settings recently, re-render
        if (profilePicRendered === null || cachedImage === undefined || Date.parse(profilePicRendered.lastRendered.toString()) < Date.parse(profilePicEntry.updatedAt.toString())) {

            if (profilePicRendered === null || cachedImage === undefined) {
                logger.info('Cache miss: Rendering profile image for the first time.', { userId });
            } else {
                logger.info('Cache miss: Rendering profile picture cached image has been invalidated.', { userId });
            }

            const response: AxiosResponse<string> = await remotionAxios.post('/getProfilePic', templateObj);
            const base64Image: string = response.data;

            const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
            // update the last render time table and upload this image to s3
            if (profilePictureStatus === 200) {
                await updateProfilePicRenderedDB(userId);
                await uploadBase64(profilePicCacheBucketName, userId, base64Image);
            }

            return profilePictureStatus === 200 ? res.status(200).send('Set profile picture to given template.') : res.status(400).send('Unable to set profile picture.');
        } else {
            logger.info('Cache hit: not re-rendering profile image.', { userId });
        }

        // otherwise, update the profilePicture with the cachedImage
        logger.info('Image is valid, updating from cache', { userId });
        const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, cachedImage);
        return profilePictureStatus === 200 ? res.status(200).send('Set profile picture to given template.') : res.status(400).send('Unable to set profile picture.');
    }
}
