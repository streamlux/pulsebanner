import { flipFeatureEnabled } from '@app/services/postgresHelpers';
import env from '@app/util/env';
import { getTwitterProfilePic, TwitterResponseCode, updateProfilePic, validateTwitterAuthentication } from '@app/services/twitter/twitterHelpers';
import { RenderedProfileImage } from '@prisma/client';
import imageToBase64 from 'image-to-base64';
import { Feature } from '../Feature';
import { S3Service } from '@app/services/S3Service';
import { AccountsService } from '@app/services/AccountsService';
import { ProfilePicService } from '@app/services/ProfilePicService';
import { Context } from '@app/services/Context';
import { RenderProfilePicRequest, RenderResponse } from '@app/services/remotion/RemotionClient';
import { getProfileImageProps } from '@app/services/profileImage/getProfileImageProps';
import { RenderProps } from '@pulsebanner/remotion/types';

const profileImageStreamUp: Feature<string> = async (context: Context): Promise<string> => {
    const { userId } = context;

    const profilePicRendered: RenderedProfileImage | null = await ProfilePicService.getProfilePicRendered(userId); // compare to updatedAt time and only update if later
    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    const validatedTwitter = twitterInfo && await validateTwitterAuthentication(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(context, 'profileImage');
        context.logger.error('Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature profileImage and requiring re-auth.';
    }

    if (twitterInfo === null) {
        context.logger.error('Unable to get twitterInfo for user on streamup', { userId });
        return 'Unable to get twitterInfo for user on streamup';
    }

    // profile pic bucket name
    const profilePicBucketName: string = env.PROFILE_PIC_BUCKET_NAME;
    const profilePicCacheBucketName: string = env.PROFILE_PIC_CACHE_BUCKET;

    // get the existing profile pic
    const profilePicUrl: string = await getTwitterProfilePic(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);

    //upload profilePicUrl as base64 to s3 storage
    const dataToUpload: string = profilePicUrl === 'empty' ? 'empty' : await imageToBase64(profilePicUrl);
    try {
        await S3Service.uploadBase64(context, profilePicBucketName, userId, dataToUpload);
    } catch (e) {
        context.logger.error('Error uploading original profile picture to S3.');
        return 'Error uploading original banner to S3.';
    }

    const profilePicEntry = await ProfilePicService.getProfilePicEntry(userId);
    if (!profilePicEntry) {
        context.logger.error('Unable to get profilePicEntry for user on streamup', { userId });
        return 'Unable to get profilePicEntry for user on streamup';
    }

    // check here if we have previously rendered the profile picture. Update if they have saved more recent than what we have saved in the render time

    // if we do not have the image in s3, we also need to remove it
    const cachedImage: string | undefined = await S3Service.download(context, profilePicCacheBucketName, userId);

    // if we do not have anything stored for the current profilePicRendered, do not have a cachedImage, or have updated the settings recently, re-render
    if (profilePicRendered === null || cachedImage === undefined || Date.parse(profilePicRendered.lastRendered.toString()) < Date.parse(profilePicEntry.updatedAt.toString())) {
        if (profilePicRendered === null || cachedImage === undefined) {
            context.logger.info('Cache miss: Rendering profile image for the first time.', { userId });
        } else {
            context.logger.info('Cache miss: Rendering profile picture cached image has been invalidated.', { userId });
        }

        const renderProps: RenderProps = await getProfileImageProps(context, { userId, twitterInfo })
        const renderRequest: RenderProfilePicRequest = new RenderProfilePicRequest(context, renderProps);

        const renderResponse: RenderResponse = await renderRequest.send();
        const base64Image: string = renderResponse.data;

        const profilePictureStatus: TwitterResponseCode = await updateProfilePic(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
        // update the last render time table and upload this image to s3
        if (profilePictureStatus === 200) {
            await ProfilePicService.updateProfilePicRenderedDB(userId);
            await S3Service.uploadBase64(context, profilePicCacheBucketName, userId, base64Image);
        }

        return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
    } else {
        context.logger.info('Cache hit: not re-rendering profile image.');
    }

    // otherwise, update the profilePicture with the cachedImage
    context.logger.info('Image is valid, updating from cache');
    const profilePictureStatus: TwitterResponseCode = await updateProfilePic(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, cachedImage);
    return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
};

export default profileImageStreamUp;
