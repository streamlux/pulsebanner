import { TwitterClient } from 'twitter-api-client';
import { log } from '../discord/log';

export type TwitterResponseCode = 200 | 400;

const createTwitterClient = (oauth_token: string, oauth_token_secret: string): TwitterClient => {
    return new TwitterClient({
        apiKey: process.env.TWITTER_ID,
        apiSecret: process.env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });
};

export async function getBanner(oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    let imageUrl: string = undefined;
    try {
        const response = await client.accountsAndUsers.usersProfileBanner({
            user_id: providerAccountId,
        });
        imageUrl = response.sizes['1500x500'].url;
        log('imageUrl: ', imageUrl);
    } catch (e) {
        log('User does not have a banner setup. Will save empty for later: ', e);
        imageUrl = 'empty';
    }

    return imageUrl;
}

// pass it the banner so we can just upload the base64 or image url directly
export async function updateBanner(oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // We store empty string if user did not have an existing banner
    if (bannerBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountRemoveProfileBanner();
        } catch (e) {
            log('Error: ', e);
            return 400;
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileBanner({
                banner: bannerBase64,
            });
        } catch (e) {
            if ('errors' in e) {
                // Twitter API error
                if (e.errors[0].code === 88)
                    // rate limit exceeded
                    log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
                // some other kind of error, e.g. read-only API trying to POST
                else log('Other error');
            } else {
                // non-API error, e.g. network problem or invalid JSON in response
                log('Non api error');
            }
            log('Failed to update banner');
            return 400;
        }
    }
    log('Banner updated.');
    return 200;
}

// pass in the twitch url here that we will get from somewhere the user uploads it (TBD)
export async function tweetStreamStatusLive(oauth_token: string, oauth_token_secret: string, streamLink?: string, tweetContent?: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `I am live! Come join the stream on twitch! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        log('error with publishing the tweet: ', e);
        return 400;
    }
    return 200;
}

export async function tweetStreamStatusOffline(oauth_token: string, oauth_token_secret: string, streamLink?: string, tweetContent?: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `Thanks for watching! I will be live again soon! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        log('error with publishing the tweet: ', e);
        return 400;
    }
    return 200;
}
