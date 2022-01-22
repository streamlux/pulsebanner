import { TwitchClientAuthService } from "@app/services/TwitchClientAuthService";
import { twitchAxios, remotionAxios } from "@app/util/axios";
import { getTwitterInfo, flipFeatureEnabled, getBannerEntry } from "@app/util/database/postgresHelpers";
import { getAccountsById } from "@app/util/getAccountsById";
import { uploadBase64 } from "@app/util/s3/upload";
import { checkValidDownload } from "@app/util/s3/validateHelpers";
import { validateTwitterAuthentication, getBanner, TwitterResponseCode, updateBanner } from "@app/util/twitter/twitterHelpers";
import { Prisma } from "@prisma/client";
import { AxiosResponse } from "axios";
import imageToBase64 from "image-to-base64";
import { env } from "process";
import { Feature } from "../Feature";
import { logger } from '@app/util/logger';

export type TemplateRequestBody = {
    foregroundId: string;
    backgroundId: string;
    foregroundProps: Record<string, unknown>;
    backgroundProps: Record<string, unknown>;
};

const bannerStreamUp: Feature<string> = async (userId: string): Promise<string> => {

    const accounts = await getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    const twitterInfo = await getTwitterInfo(userId, true);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'banner');
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    // get the banner info saved in Banner table
    const bannerEntry = await getBannerEntry(userId);
    if (bannerEntry === null || twitterInfo === null) {
        return 'Could not find banner entry or twitter info for user';
    }

    const authedTwitchAxios = await TwitchClientAuthService.authAxios(twitchAxios);

    // get twitch stream info for user
    // https://dev.twitch.tv/docs/api/reference#get-streams
    const streamResponse = await authedTwitchAxios.get(`/helix/streams?user_id=${twitchUserId}`);

    // get twitch user
    // https://dev.twitch.tv/docs/api/reference#get-users
    const userResponse = await authedTwitchAxios.get(`/helix/users?id=${twitchUserId}`);
    const twitchUserInfo = userResponse.data.data[0];

    // get twitch thumbnail, defaulting to the url given by the api, but falling back to a manually constructed one
    const defaultStreamThumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUserInfo.login as string}-440x248.jpg`;
    const streamThumbnailUrlTemplate: string = streamResponse.data?.data?.[0]?.thumbnail_url ?? defaultStreamThumbnailUrl;
    const streamThumbnailUrl: string = streamThumbnailUrlTemplate.replace('{width}', '440').replace('{height}', '248');

    // call twitter api to get imageUrl and convert to base64
    const bannerUrl: string = await getBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, twitterInfo.providerAccountId);
    const bucketName = env.IMAGE_BUCKET_NAME;

    // https://stackoverflow.com/a/58158656/10237052

    console.log('bannerUrl', bannerUrl);

    // store the current banner in s3
    const dataToUpload: string = bannerUrl === 'empty' ? 'empty' : await imageToBase64(bannerUrl);

    logger.info('validation - dataToUpload correct on streamup: ', { valid: checkValidDownload(dataToUpload) });
    if (!checkValidDownload(dataToUpload)) {
        // just print first 10 chars of base64 to see what is invalid
        logger.warn(`incorrect data. userid: ${userId}\tdataToUpload: ${dataToUpload.substring(0, 10)} `, { userId, string: dataToUpload.substring(0, 10) });
    }
    // check if invalid base64
    // if (!checkValidDownload(dataToUpload)) {
    //     // attempt to re-fetch
    //     const refetch = await imageToBase64(bannerUrl);
    //     // check valid download once more
    //     if (!checkValidDownload(refetch)) {
    //         // if we are invalid again, fail the request
    //         console.log('Corrupt base64 image. Uploading signup image');
    //         const original = await download(env.BANNER_BACKUP_BUCKET, userId);
    //         if (!checkValidDownload(original)) {
    //             console.log('Corrupt signup image. Failing request');
    //             return res.status(400).send('Corrupt signup image. Failing request');
    //         } else {
    //             dataToUpload = original;
    //         }
    //     } else {
    //         dataToUpload = refetch;
    //     }
    // }

    try {
        await uploadBase64(bucketName, userId, dataToUpload);
    } catch (e) {
        logger.error('Error uploading original banner to S3', { userId });
        return 'Error uploading original banner to S3.';
    }

    // construct template object
    const templateObj: TemplateRequestBody = {
        backgroundId: bannerEntry.backgroundId ?? 'CSSBackground',
        foregroundId: bannerEntry.foregroundId ?? 'ImLive',
        // pass in thumbnail url
        foregroundProps: { ...(bannerEntry.foregroundProps as Prisma.JsonObject), thumbnailUrl: streamThumbnailUrl } ?? {},
        backgroundProps: (bannerEntry.backgroundProps as Prisma.JsonObject) ?? {},
    };

    // pass in the bannerEntry info
    const response: AxiosResponse<string> = await remotionAxios.post('/getTemplate', templateObj);
    const base64Image: string = response.data;

    // post this base64 image to twitter
    const bannerStatus: TwitterResponseCode = await updateBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, base64Image);
    return bannerStatus === 200 ? 'Set banner to given template' : 'Unable to set banner';

}

export default bannerStreamUp;
