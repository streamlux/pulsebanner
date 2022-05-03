import prisma from "@app/util/ssr/prisma";
import { Feature } from "@app/features/Feature";
import { flipFeatureEnabled } from "@app/services/postgresHelpers";
import { TwitterResponseCode, updateBanner, validateTwitterAuthentication } from "@app/services/twitter/twitterHelpers";
import { renderBanner } from "./renderBanner";
import { AccountsService } from "@app/services/AccountsService";
import { Context } from "@app/services/Context";

export const bannerRefresh: Feature<string> = async (context: Context): Promise<string> => {
    const { userId } = context;
    /**
     * 1. Render banner image
     * 2. Check if user is still live according to our database
     * 3. Update twitter banner
     */

    const accounts = await AccountsService.getAccountsById(userId);
    const twitchUserId = accounts['twitch'].providerAccountId;

    context.logger.info('Refreshing banner', { userId });

    if (!twitchUserId) {
        return 'Missing twitchUserId';
    }

    const twitterInfo = await AccountsService.getTwitterInfo(userId, true);

    // if they are not authenticated with twitter, return 401 and turn off the feature
    const validatedTwitter = await validateTwitterAuthentication(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret);
    if (!validatedTwitter) {
        await flipFeatureEnabled(context, 'banner');
        context.logger.error('Unauthenticated Twitter. Disabling feature banner and requiring re-auth.', { userId });
        return 'Unauthenticated Twitter. Disabling feature banner and requiring re-auth.';
    }

    let bannerBase64: string;
    try {
        // render banner
        bannerBase64 = await renderBanner(context, twitchUserId);
    } catch (e) {
        context.logger.error('Error rendering banner for banner refresh', { error: e });
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
        const bannerStatus: TwitterResponseCode = await updateBanner(context, twitterInfo.oauth_token, twitterInfo.oauth_token_secret, bannerBase64);
        return bannerStatus === 200 ? 'Set banner to given template' : 'Unable to set banner';
    } else {
        context.logger.warn('Stream ended while rendering banner for refresh.', { userId });
        return 'Stream ended while rendering banner for refresh.';
    }

}
