import { remotionAxios } from "@app/util/axios";
import { getProfilePicEntry, getProfilePicRendered, getTwitterInfo, updateProfilePicRenderedDB } from "@app/util/database/postgresHelpers";
import { download } from "@app/util/s3/download";
import { uploadBase64 } from "@app/util/s3/upload";
import { getTwitterProfilePic, TwitterResponseCode, updateProfilePic } from "@app/util/twitter/twitterHelpers";
import { RenderedProfileImage, Prisma } from "@prisma/client";
import { AxiosResponse } from "axios";
import imageToBase64 from "image-to-base64";
import { env } from "process";
import { Feature } from "../Feature";

export type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

const profileImageStreamUp: Feature<string> = async (userId: string): Promise<string> => {
    const profilePicEntry = await getProfilePicEntry(userId);
    const profilePicRendered: RenderedProfileImage | null = await getProfilePicRendered(userId); // compare to updatedAt time and only update if later
    const twitterInfo = await getTwitterInfo(userId, true);

    if (profilePicEntry === null || twitterInfo === null) {
        return 'Unable to get profilePicEntry or twitterInfo for user on streamup';
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
        console.error('Error uploading original profile picture to S3.');
        return 'Error uploading original banner to S3.';
    }

    const templateObj: TemplateRequestBody = {
        backgroundId: profilePicEntry.backgroundId ?? 'CSSBackground',
        foregroundId: profilePicEntry.foregroundId ?? 'ProfilePic',
        foregroundProps: { ...(profilePicEntry.foregroundProps as Prisma.JsonObject) } ?? {},
        backgroundProps: (profilePicEntry.backgroundProps as Prisma.JsonObject) ?? {},
    };

    // check here if we have previously rendered the profile picture. Update if they have saved more recent than what we have saved in the render time

    // if we do not have the image in s3, we also need to remove it
    const cachedImage: string | undefined = await download(profilePicCacheBucketName, userId);

    // if we do not have anything stored for the current profilePicRendered, do not have a cachedImage, or have updated the settings recently, re-render
    if (profilePicRendered === null || cachedImage === undefined || Date.parse(profilePicRendered.lastRendered.toString()) < Date.parse(profilePicEntry.updatedAt.toString())) {

        if (profilePicRendered === null || cachedImage === undefined) {
            console.log('Cache miss: Rendering profile image for the first time.');
        } else {
            console.log('Cache miss: Rendering profile picture cached image has been invalidated.');
        }

        const response: AxiosResponse<string> = await remotionAxios.post('/getProfilePic', templateObj);
        const base64Image: string = response.data;

        const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
        // update the last render time table and upload this image to s3
        if (profilePictureStatus === 200) {
            await updateProfilePicRenderedDB(userId);
            await uploadBase64(profilePicCacheBucketName, userId, base64Image);
        }

        return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
    } else {
        console.log('Cache hit: not re-rendering profile image.');
    }

    // otherwise, update the profilePicture with the cachedImage
    console.log('Image is valid, updating from cache');
    const profilePictureStatus: TwitterResponseCode = await updateProfilePic(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, cachedImage);
    return profilePictureStatus === 200 ? 'Set profile picture to given template.' : 'Unable to set profile picture.';
}

export default profileImageStreamUp;
