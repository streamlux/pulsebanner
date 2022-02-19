import prisma from "@app/util/ssr/prisma";
import { Feature } from "@app/features/Feature";
import { flipFeatureEnabled, getTwitterInfo } from "@app/util/database/postgresHelpers";
import { getAccountsById } from "@app/util/getAccountsById";
import { logger } from "@app/util/logger";
import { TwitterResponseCode, updateBanner, validateTwitterAuthentication } from "@app/util/twitter/twitterHelpers";
import { renderBanner } from "./renderBanner";

export const bannerRefresh: Feature<string> = async (userId: string): Promise<string> => {
    /**
     * 1. Render banner image
     * 2. Check if user is still live according to our database
     * 3. Update twitter banner
     */

    const accounts = await getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    logger.info('Refreshing banner', { userId });

    if (!twitchUserId) {
        return 'Missing twitchUserId';
    }

    const twitterInfo = await getTwitterInfo(userId, true);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(userId, 'banner');
        logger.error('Unauthenticated Twitter. Disabling feature banner and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    let bannerBase64: string;
    try {
        // render banner
        bannerBase64 = await renderBanner(userId, twitchUserId);
    } catch (e) {
        logger.error('Error rendering banner for banner refresh', { error: e });
        return 'Unable to refresh banner';
    }
    // check if user is still live according to our database
    // since it's possible that while rendering the banner the stream ended
    const liveStream = await prisma.liveStreams.findUnique({
        where: {
            userId
        }
    });

    if (liveStream !== null) {
        // post this base64 image to twitter
        const bannerStatus: TwitterResponseCode = await updateBanner(userId, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, bannerBase64);
        return bannerStatus === 200 ? 'Set banner to given template' : 'Unable to set banner';
    } else {
        logger.warn('Stream ended while rendering banner for refresh.', { userId });
    }

}
