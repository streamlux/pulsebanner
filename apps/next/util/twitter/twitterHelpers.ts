import { TwitterClient } from 'twitter-api-client';
import { sendError } from '../discord/sendError';

export type TwitterResponseCode = 200 | 400;

export const createTwitterClient = (oauth_token: string, oauth_token_secret: string): TwitterClient => {
    return new TwitterClient({
        apiKey: process.env.TWITTER_ID,
        apiSecret: process.env.TWITTER_SECRET,
        accessToken: oauth_token,
        accessTokenSecret: oauth_token_secret,
    });
};

export async function getBanner(userId: string, oauth_token: string, oauth_token_secret: string, providerAccountId: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    let imageUrl: string = undefined;
    try {
        const response = await client.accountsAndUsers.usersProfileBanner({
            user_id: providerAccountId,
        });
        imageUrl = response.sizes['1500x500'].url;
        console.log('imageUrl: ', imageUrl);
    } catch (e) {
        console.log('User does not have a banner setup. Will save empty for later: ');
        imageUrl = 'empty';
    }

    return imageUrl;
}

// pass it the banner so we can just upload the base64 or image url directly
export async function updateBanner(userId: string, oauth_token: string, oauth_token_secret: string, bannerBase64: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    // We store empty string if user did not have an existing banner
    if (bannerBase64 === 'empty') {
        try {
            await client.accountsAndUsers.accountRemoveProfileBanner();
        } catch (e) {
            handleTwitterApiError(userId, e);
            return 400;
        }
    } else {
        try {
            await client.accountsAndUsers.accountUpdateProfileBanner({
                banner: bannerBase64,
            });
        } catch (e) {
            handleTwitterApiError(userId, e);
            console.log('failed to update banner');
            return 400;
        }
    }
    console.log('success updating banner');
    return 200;
}

// pass in the twitch url here that we will get from somewhere the user uploads it (TBD)
export async function tweetStreamStatusLive(
    userId: string,
    oauth_token: string,
    oauth_token_secret: string,
    streamLink?: string,
    tweetContent?: string
): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `I am live! Come join the stream on twitch! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        console.log('error with publishing the tweet: ', e);
        handleTwitterApiError(userId, e);
        return 400;
    }
    return 200;
}

export async function tweetStreamStatusOffline(
    userId: string,
    oauth_token: string,
    oauth_token_secret: string,
    streamLink?: string,
    tweetContent?: string
): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.tweets.statusesUpdate({
            status: tweetContent === undefined ? `Thanks for watching! I will be live again soon! ${streamLink}` : `${tweetContent} ${streamLink}`,
        });
    } catch (e) {
        // there could be a problem with how long the string is
        console.log('error with publishing the tweet: ', e);
        handleTwitterApiError(userId, e);
        return 400;
    }
    return 200;
}

export async function getCurrentTwitterName(userId: string, oauth_token: string, oauth_token_secret: string): Promise<string> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        const account = await client.accountsAndUsers.accountVerifyCredentials();
        const name = account.name;
        return name;
    } catch (e) {
        console.log('Errror getting twitter name: ', e);
        handleTwitterApiError(userId, e);
        return '';
    }
}

export async function updateTwitterName(userId: string, oauth_token: string, oauth_token_secret: string, name: string): Promise<TwitterResponseCode> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);

    try {
        await client.accountsAndUsers.accountUpdateProfile({ name: name });
    } catch (e) {
        console.log('error updating twitter name: ', e);
        await handleTwitterApiError(userId, e, 'Updating Twitter name');
        return 400;
    }
    return 200;
}

export async function validateAuthentication(oauth_token: string, oauth_token_secret: string): Promise<boolean> {
    const client = createTwitterClient(oauth_token, oauth_token_secret);
    // if we get a vaild response, we know they are verified and have not revoked the application. They could be still signed in at this point regardless
    try {
        await client.accountsAndUsers.accountVerifyCredentials();
    } catch (e) {
        // any failure (regardless or error code) make them re-authenticate
        console.log('unsuccessful twitter authentication, requiring re-authentication.');
        return false;
    }
    return true;
}

// would need to pass in the userId here
async function handleTwitterApiError(userId: string, e: { errors?: { message: string; code: number }[]; _headers?: any }, context?: string) {
    if ('errors' in e) {
        // Twitter API error
        if (e.errors[0].code === 88) {
            // rate limit exceeded
            console.error('Rate limit error, code 88. Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
            sendError({ ...e.errors[0], name: 'TwitterRateLimitError' }, context);
        } else if (e.errors[0].code === 89) {
            // Invalid or expired token error.
            // check the db to see if they currently have an invalid token stored. Do not write if they do
            // const tokenInvalid = await getAccountTwitterTokenStatus(userId);
            // // only update if it is not stored (i.e. false)
            // if (tokenInvalid === false) {
            //     await updateAccountTwitterToken(userId, true);
            // }

            sendError({ ...e.errors[0], name: 'TwitterAPIInvalidTokenError' }, `Invalid or expired token error. userId: ${userId}\t Context: ${context}`);
        }
        // some other kind of error, e.g. read-only API trying to POST
        else {
            sendError(e as any, `Other Twitter API error occured. userId: ${userId}\t Context: ${context}`);
        }
    } else {
        // non-API error, e.g. network problem or invalid JSON in response
        sendError(e as any, `Non Twitter API error occured. userId: ${userId}\t Context: ${context}`);
    }
}
